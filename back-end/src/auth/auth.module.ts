import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  controllers: [AuthController],
  imports: [UsuariosModule],
  providers: [AuthService],
})
export class AuthModule {}
