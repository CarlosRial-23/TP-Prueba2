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
      // Si encontramos un usuario, lanzamos un error 409 (Conflict)
      throw new ConflictException('El correo electrónico ya está registrado');
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUsuarioDto.contrasenia, saltOrRounds);
    const usuarioData = {
      ...createUsuarioDto, 
      contrasenia: hash,
      fechaNacimiento: new Date(createUsuarioDto.fechaNacimiento),
    };
    
    const usuario = new this.UsuarioModel(usuarioData);
    

    try {
        const guardado = await usuario.save();
        return guardado;
    } catch (error) {
        console.error('Error al guardar usuario en la DB:', error);
        throw new InternalServerErrorException('Error desconocido al crear el usuario. Revise los logs del servidor para detalles del error de Mongoose.');
    }
  }

  async findAll() {
    const todos = await this.UsuarioModel.find();
    
    return todos;
  }
  
  async findOne(id: string) {
    
    const resultado  = await this.UsuarioModel.findById(id);
    return resultado;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    console.log(updateUsuarioDto);
    const modificado = await this.UsuarioModel.updateOne(
      {_id : id},
      updateUsuarioDto,
    )
    
    return modificado;
  }

  async remove(id: string) {
    const eliminado = await this.UsuarioModel.deleteOne({_id : id})
    return eliminado;
  }

  
}
