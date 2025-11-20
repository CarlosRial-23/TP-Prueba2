import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtGuard } from '../guards/jwt/jwt.guard';
import { AdminGuard } from '../guards/admin.guard';

@UseGuards(JwtGuard, AdminGuard) // Solo admins ven estadísticas
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  async getPublicacionesPorUsuario(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.estadisticasService.getPublicacionesPorUsuario(new Date(desde), new Date(hasta));
  }

  @Get('comentarios-totales')
  async getComentariosTotales(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.estadisticasService.getComentariosTotales(new Date(desde), new Date(hasta));
  }
  
  @Get('comentarios-por-publicacion')
  async getComentariosPorPublicacion(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.estadisticasService.getComentariosPorPublicacion(new Date(desde), new Date(hasta));
  }
}