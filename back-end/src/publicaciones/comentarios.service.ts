import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comentario } from './entities/comentario.entity';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  // Crear un comentario nuevo
  async create(publicacionId: string, userId: string, mensaje: string) {
    const nuevo = new this.comentarioModel({
      publicacion: publicacionId,
      autor: userId,
      mensaje: mensaje,
    });
    // Guardamos y poblamos el autor para devolverlo completo
    const guardado = await nuevo.save();
    return guardado.populate('autor', 'nombreUsuario urlFoto');
  }

  // Listar comentarios de una publicación (con paginación)
  async findAllByPublicacion(publicacionId: string, limit: number, offset: number) {
    const comentarios = await this.comentarioModel
      .find({ publicacion: publicacionId, activo: true })
      .sort({ createdAt: -1 }) // Orden: más recientes primero
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombreUsuario urlFoto') // Traemos datos del autor
      .exec();
      
    const total = await this.comentarioModel.countDocuments({ publicacion: publicacionId, activo: true });
    return { comentarios, total };
  }

  // Editar un comentario (Solo el autor puede hacerlo)
  async update(id: string, userId: string, mensaje: string) {
    const comentario = await this.comentarioModel.findById(id);
    
    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }
    
    // Validamos que el usuario sea el dueño del comentario
    if (comentario.autor.toString() !== userId) {
      throw new UnauthorizedException('No puedes editar este comentario');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true; // Marcamos que fue editado
    return await comentario.save();
  }
}