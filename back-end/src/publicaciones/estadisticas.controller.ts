import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtGuard } from '../guards/jwt/jwt.guard';
import { AdminGuard } from '../guards/admin.guard';

@UseGuards(JwtGuard, AdminGuard)
@Controller('estadisticas')
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  // Función auxiliar para ajustar la fecha al final del día
  private getFinDelDia(fechaString: string): Date {
    const fecha = new Date(fechaString);
    fecha.setHours(23, 59, 59, 999); // Ajustar a la última milésima del día
    return fecha;
  }

  @Get('publicaciones-por-usuario')
  async getPublicacionesPorUsuario(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    // Convertimos 'desde' normal (00:00) y 'hasta' al final del día
    return this.estadisticasService.getPublicacionesPorUsuario(new Date(desde), this.getFinDelDia(hasta));
  }

  // Endpoint necesario para el gráfico de Torta (Comentarios por Usuario)
  @Get('comentarios-por-usuario')
  async getComentariosPorUsuario(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.estadisticasService.getComentariosPorUsuario(new Date(desde), this.getFinDelDia(hasta));
  }

  @Get('comentarios-totales')
  async getComentariosTotales(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.estadisticasService.getComentariosTotales(new Date(desde), this.getFinDelDia(hasta));
  }
  
  @Get('comentarios-por-publicacion')
  async getComentariosPorPublicacion(@Query('desde') desde: string, @Query('hasta') hasta: string) {
    return this.estadisticasService.getComentariosPorPublicacion(new Date(desde), this.getFinDelDia(hasta));
  }
}