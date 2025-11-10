import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Usuario } from './entities/usuario.entity';
import { Model } from 'mongoose';

@Injectable()
export class UsuariosService {

  constructor(@InjectModel(Usuario.name) private UsuarioModel: Model <Usuario>){}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = new this.UsuarioModel(createUsuarioDto);
    const guardado = await usuario.save();
    return guardado;
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
