import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
} from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { JwtGuard } from '../guards/jwt/jwt.guard';

@UseGuards(JwtGuard)
@Controller('publicaciones')
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  create(@Body() createPublicacioneDto: CreatePublicacioneDto, @Req() req) {
    const userId = req.user.id;
    return this.publicacionesService.create(createPublicacioneDto, userId);
  }

  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('orden', new DefaultValuePipe('fecha')) orden: 'fecha' | 'likes',
    @Query('autorId') autorId?: string, 
  ) {
    return this.publicacionesService.findAll(limit, offset, orden, autorId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string){ 
      return this.publicacionesService.findOne(id); 
  }
  

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    const userRole = req.user.perfil; 
    return this.publicacionesService.remove(id, userId, userRole);
  }

  @Post(':id/like')
  like(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.publicacionesService.like(id, userId);
  }

  @Delete(':id/like')
  unlike(@Param('id') id: string, @Req() req) {
    const userId = req.user.id;
    return this.publicacionesService.unlike(id, userId);
  }
}