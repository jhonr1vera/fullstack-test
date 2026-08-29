import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { nombre, email, password } = registerDto;

    const emailExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new ConflictException({
        statusCode: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'El correo electrónico ya está registrado',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        activo: true,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      });
    }

    if (user.deletedAt !== null || !user.activo) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'INACTIVE_USER',
        message: 'Su cuenta ha sido eliminada o desactivada',
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException({
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      });

    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
