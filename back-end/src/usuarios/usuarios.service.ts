import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {

  constructor(@InjectModel(Usuario.name) private UsuarioModel: Model <Usuario>){}

  async findByEmail(correo: string) {
    return this.UsuarioModel.findOne({ correo: correo }).exec();
 }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuarioExistente = await this.findByEmail(createUsuarioDto.correo);
    if (usuarioExistente) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUsuarioDto.contrasenia, saltOrRounds);
    
    const usuarioData = {
      ...createUsuarioDto, 
      contrasenia: hash,
      fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
      // Aseguramos que si no viene perfil, sea usuario, y activo true por defecto
      perfil: createUsuarioDto['perfil'] || 'usuario', 
      activo: true
    };
    
    const usuario = new this.UsuarioModel(usuarioData);

    try {
        return await usuario.save();
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        throw new InternalServerErrorException('Error al crear usuario');
    }
  }

  async findAll() {
    return this.UsuarioModel.find().exec();
  }
  
  async findOne(id: string) {
    return this.UsuarioModel.findById(id);
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    return this.UsuarioModel.updateOne({_id : id}, updateUsuarioDto);
  }

  // BAJA LÓGICA (Deshabilitar)
  async remove(id: string) {
    return this.UsuarioModel.updateOne({_id : id}, { activo: false });
  }

  // ALTA LÓGICA (Habilitar)
  async restore(id: string) {
    return this.UsuarioModel.updateOne({_id : id}, { activo: true });
  }
}