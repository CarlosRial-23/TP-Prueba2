import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtGuard } from '../guards/jwt/jwt.guard';
import { AdminGuard } from '../guards/admin.guard'; // Asegúrate de tener este guard

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Registro público
  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // Creación por Administrador (Ruta protegida)
  @UseGuards(JwtGuard, AdminGuard)
  @Post('admin') 
  createByAdmin(@Body() createUsuarioDto: CreateUsuarioDto) {
    // Aquí el DTO traerá el campo 'perfil' ('usuario' o 'administrador')
    return this.usuariosService.create(createUsuarioDto);
  }

  // Listado solo para Admin
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
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  // Baja Lógica (Admin)
  @UseGuards(JwtGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }

  // Alta Lógica (Admin)
  @UseGuards(JwtGuard, AdminGuard)
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.usuariosService.restore(id);
  }
}