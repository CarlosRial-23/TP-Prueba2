import { Body,
  Controller,
  Delete,
  Get,
  Headers,
  Post,
  Req,
  Res,
  UseGuards, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredencialesDTO } from '../usuarios/dto/credencialesDto';
import type { Request, Response } from 'express';
import { JwtGuard } from '../guards/jwt/jwt.guard';
import { decode } from 'jsonwebtoken';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: CredencialesDTO) {
    return this.authService.login(body);
  }

  @Post('register')
  register(@Body() body: CreateUsuarioDto) {
    return this.authService.register(body);
  }

  @Get('data')
  traer(@Headers('Authorization') authHeader: string) {
    return this.authService.verificar(authHeader);
  }

  @UseGuards(JwtGuard)
  @Get('data/jwt')
  traerConGuard(@Req() request: any) {
    console.log(request.user);
    return { message: 'Logró pasar al verbo' };
  }


}
