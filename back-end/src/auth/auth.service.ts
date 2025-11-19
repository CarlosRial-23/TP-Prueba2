/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CredencialesDTO } from '../usuarios/dto/credencialesDto';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { CreateUsuarioDto } from 'src/usuarios/dto/create-usuario.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(private readonly usuariosService: UsuariosService) {}

  async login(user: CredencialesDTO) {
    // Buscar el usuario en la base de datos
    const usuarioExistente = await this.usuariosService.findByEmail(user.correo);

    if (!usuarioExistente) {
      throw new InternalServerErrorException('Usuario no registrado');
    }

    // Comparar contraseñas
    const esValida = await bcrypt.compare(user.contrasenia, usuarioExistente.contrasenia);

    if (!esValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // Si todo está bien, generar el token
    return this.createToken(user.correo);
  }

  async register(user: CreateUsuarioDto) {
    // Valida usuario no existe y guarda
    const usuarioExistente = await this.usuariosService.findByEmail(user.correo);
    if(usuarioExistente){
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    const nuevoUsuario = await this.usuariosService.create(user);
    return this.createToken(nuevoUsuario.correo);
  }

  async getProfile(correo: string) {
    // Busca el usuario completo en la BD usando el correo del token
    const usuario = await this.usuariosService.findByEmail(correo);
    return usuario;
  }

  // Ejemplo devuelve en body, trae desde header

  createToken(username: string) {
    const payload: { correo: string; admin: boolean } = {
        
        correo: username,
        admin: false,
        
    };
   
    // Necesito crear un token, sign es el método

    const token: string = sign(payload, process.env.CONTRASENA_SECRETA_DEL_SERVER!, {
      expiresIn: '15m',
    });
    
    

    return { token: token };
  }

  verificar(authHeader: string) {
    console.log(authHeader); // Bearer token
    if (!authHeader) throw new BadRequestException();

    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer') throw new BadRequestException();

    try {
      const tokenValidado = verify(token, process.env.CONTRASENA_SECRETA_DEL_SERVER!);
      return tokenValidado; // info de la payload
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return 'Token expirado';
      }
      if (error instanceof JsonWebTokenError) {
        return 'Firma falló o tóken modificado';
      }

      throw new InternalServerErrorException();
    }
  }

  refreshToken(user: CredencialesDTO) {
      
    
    return {
      token: this.createToken(user.correo), // Genera uno nuevo con 15m más
    };
  }
  
}
