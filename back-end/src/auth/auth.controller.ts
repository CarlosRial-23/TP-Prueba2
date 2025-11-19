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

  @UseGuards(JwtGuard)
  @Post('autorizar')
  @HttpCode(HttpStatus.OK)
  async autorizar(@Req() req) {
    // Ahora req.user YA EXISTE gracias al JwtGuard corregido.
    // Usamos el correo del token para buscar todos los datos en la BD
    const usuarioCompleto = await this.authService.getProfile(req.user.correo);
    
    return { status: 'ok', usuario: usuarioCompleto };
  }

  // REQUISITO: Ruta Refrescar
  @UseGuards(JwtGuard)
  @Post('refresh')
  refresh(@Req() req) {
    // Generamos un nuevo token para el usuario actual
    return this.authService.refreshToken(req.user);
  }
}

