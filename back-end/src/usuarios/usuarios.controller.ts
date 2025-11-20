import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtGuard } from '../guards/jwt/jwt.guard';
import { AdminGuard } from '../guards/admin.guard'; 


@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // REQUISITO SPRINT 4: Listar usuarios (Solo Admin)
  @UseGuards(JwtGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    // Aquí podrías agregar validación para que solo uno mismo pueda editarse
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  @UseGuards(JwtGuard, AdminGuard)
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.usuariosService.restore(id);
  }
  
  // REQUISITO SPRINT 4: Crear usuario desde admin (pueden elegir rol)
  // Puedes reutilizar el create normal o hacer uno específico si el DTO cambia para recibir 'perfil'
  @UseGuards(JwtGuard, AdminGuard)
  @Post('admin/create')
  createByAdmin(@Body() createUsuarioDto: CreateUsuarioDto) {
      // El DTO debería permitir el campo 'perfil' o asignarlo manualmente aquí
      return this.usuariosService.create(createUsuarioDto);
  }
}
