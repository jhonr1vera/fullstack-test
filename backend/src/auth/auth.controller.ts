import { Controller, Post, Body, Get, UseInterceptors, ClassSerializerInterceptor, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { Public } from '../shared/decorators/public.decorator.js';
import { CurrentUser } from '../shared/decorators/current-user.decorator.js';
import { isProduction } from '../shared/utils/env.js';
import type * as client from '@prisma/client';
import * as express from 'express';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    return new UserResponseDto(user);
  }

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    const result = await this.authService.login(loginDto);

    // Inyectamos cookie HTTPOnly para validar la sesión
    res.cookie('token', result.access_token, {
      httpOnly: true,
      secure: isProduction(this.configService),
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      success: true,
      access_token: result.access_token,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: express.Response) {

    // Limpiar la cookie de sesión
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction(this.configService),
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  }

  @Get('me')
  async me(@CurrentUser() user: client.User) {
    return new UserResponseDto(user);
  }
}
