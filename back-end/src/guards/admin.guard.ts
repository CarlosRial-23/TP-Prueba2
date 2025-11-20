import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificamos si el usuario existe y si su perfil es 'administrador'
    if (user && user.perfil === 'administrador') {
      return true;
    }

    throw new UnauthorizedException('Se requieren permisos de administrador');
  }
}