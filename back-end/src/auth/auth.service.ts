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
    const usuarioExistente = await this.usuariosService.findByEmail(user.correo);

    if (!usuarioExistente) {
      throw new InternalServerErrorException('Usuario no registrado');
    }

    const esValida = await bcrypt.compare(user.contrasenia, usuarioExistente.contrasenia);

    if (!esValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    // CORRECCIÓN: Pasar el objeto de usuario completo (con _id y perfil)
    return this.createToken(usuarioExistente);
  }

  async register(user: CreateUsuarioDto) {
    const usuarioExistente = await this.usuariosService.findByEmail(user.correo);
    if(usuarioExistente){
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    const nuevoUsuario = await this.usuariosService.create(user);
    
    // CORRECCIÓN: Pasar el nuevo usuario completo
    return this.createToken(nuevoUsuario);
  }

  async getProfile(correo: string) {
    // Busca el usuario completo en la BD usando el correo del token
    const usuario = await this.usuariosService.findByEmail(correo);
    return usuario;
  }

  // Ejemplo devuelve en body, trae desde header

  createToken(user: any) {
    const payload = {
        // MongoDB usa _id, nos aseguramos de enviarlo como 'id' para que el controlador lo lea fácil
        id: user._id || user.id, 
        correo: user.correo,
        // Importante: Usar el perfil real del usuario, no hardcodeado
        perfil: user.perfil || 'usuario', 
        admin: user.perfil === 'administrador' // Mantener compatibilidad si usas este flag
    };
   
    const token: string = sign(payload, process.env.CONTRASENA_SECRETA_DEL_SERVER!, {
      expiresIn: '15m',
    });

    return { token: token };
  }

  verificar(authHeader: string) {
    // console.log(authHeader); 
    if (!authHeader) throw new BadRequestException();

    const [tipo, token] = authHeader.split(' ');

    if (tipo !== 'Bearer') throw new BadRequestException();

    try {
      const tokenValidado = verify(token, process.env.CONTRASENA_SECRETA_DEL_SERVER!);
      return tokenValidado; 
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

  refreshToken(userPayload: any) {
    return {
      token: this.createToken(userPayload).token, 
    };
  }
  
}
