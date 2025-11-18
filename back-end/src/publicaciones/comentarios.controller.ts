import { Controller, Get, Post, Body, Param, Put, Query, UseGuards, Req, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ComentariosService } from './comentarios.service';
import { JwtGuard } from '../guards/jwt/jwt.guard';

@UseGuards(JwtGuard) // Protegemos todas las rutas
@Controller('comentarios')
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  // POST /comentarios/:publicacionId -> Crear comentario
  @Post(':publicacionId')
  create(
    @Param('publicacionId') publicacionId: string,
    @Body('mensaje') mensaje: string,
    @Req() req,
  ) {
    return this.comentariosService.create(publicacionId, req.user.id, mensaje);
  }

  // GET /comentarios/:publicacionId -> Listar comentarios
  @Get(':publicacionId')
  findAll(
    @Param('publicacionId') publicacionId: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return this.comentariosService.findAllByPublicacion(publicacionId, limit, offset);
  }

  // PUT /comentarios/:id -> Editar comentario
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body('mensaje') mensaje: string,
    @Req() req,
  ) {
    return this.comentariosService.update(id, req.user.id, mensaje);
  }
}