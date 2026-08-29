import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;

  @Exclude()
  password?: string;

  @Exclude()
  deletedAt?: string | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
