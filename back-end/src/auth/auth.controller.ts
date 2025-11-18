import { Controller, Post, Body, UseGuards, Req, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { CredencialesDTO } from '../usuarios/dto/credencialesDto';
import { JwtGuard } from '../guards/jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() credencialesDto: CredencialesDTO) {
    return this.authService.login(credencialesDto);
  }

  @Post('register')
  register(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.authService.register(createUsuarioDto);
  }

  // REQUISITO: Ruta Autorizar
  @UseGuards(JwtGuard)
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  autorizar(@Req() req) {
    // Si el JwtGuard permite pasar, el token es válido.
    // Devolvemos el usuario decodificado (req.user)
    return { status: 'ok', usuario: req.user };
  }

  // REQUISITO: Ruta Refrescar
  @UseGuards(JwtGuard)
  @Post('refresh')
  refresh(@Req() req) {
    // Generamos un nuevo token para el usuario actual
    return this.authService.refreshToken(req.user);
  }
}

