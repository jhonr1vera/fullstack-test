import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;

  @Exclude()
  password?: string;

  @Exclude()
  deletedAt?: Date | string | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
