import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    // 1. Verificar que exista la cabecera
    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó token de autorización');
    }

    // 2. Verificar formato "Bearer <token>"
    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const token = partes[1];

    try {
      // 3. Verificar la firma del token usando la misma clave secreta que en AuthService
      const secret = process.env.CONTRASENA_SECRETA_DEL_SERVER;
      if (!secret) {
          console.error("ERROR: Variable de entorno CONTRASENA_SECRETA_DEL_SERVER no definida");
          return false;
      }

      const payload = verify(token, secret);

      // 4. IMPORTANTE: Adjuntar el usuario (payload) al objeto request
      request.user = payload;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}