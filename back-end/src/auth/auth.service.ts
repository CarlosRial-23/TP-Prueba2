/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CredencialesDTO } from '../usuarios/dto/credencialesDto';
import {
  JsonWebTokenError,
  sign,
  TokenExpiredError,
  verify,
} from 'jsonwebtoken';

@Injectable()
export class AuthService {
  login(user: CredencialesDTO) {
    // Lee de la base de datos y confirma usuario válido y comprara contraseñas encriptadas.
    return this.createToken(user.correo);
  }

  register(user: CredencialesDTO) {
    // Valida usuario no existe y guarda
    return this.createToken(user.correo);
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
  
}
