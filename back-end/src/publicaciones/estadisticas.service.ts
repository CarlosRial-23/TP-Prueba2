import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicacione.entity';
import { Comentario } from './entities/comentario.entity';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  // Gráfico de Barras: Publicaciones por usuario
  async getPublicacionesPorUsuario(desde: Date, hasta: Date) {
    return this.publicacionModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta },
          activa: true 
        },
      },
      {
        $group: {
          _id: '$autor', 
          cantidad: { $sum: 1 }, // Esto cuenta +1 por cada publicación encontrada
        },
      },
      {
        $lookup: { 
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuarioInfo',
        },
      },
      { $unwind: '$usuarioInfo' },
      {
        $project: {
          nombreUsuario: '$usuarioInfo.nombreUsuario',
          cantidad: 1,
        },
      },
    ]);
  }

  // Gráfico de Torta: Comentarios realizados POR USUARIO
  // --- AGREGAR ESTE MÉTODO ---
  async getComentariosPorUsuario(desde: Date, hasta: Date) {
    return this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta }
        },
      },
      {
        // Agrupamos por el autor del comentario
        $group: {
          _id: '$autor', 
          cantidad: { $sum: 1 }, // Contamos cada comentario
        },
      },
      {
        // Buscamos el nombre del usuario para mostrarlo en la torta
        $lookup: { 
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuarioInfo',
        },
      },
      { $unwind: '$usuarioInfo' },
      {
        $project: {
          nombreUsuario: '$usuarioInfo.nombreUsuario',
          cantidad: 1,
        },
      },
    ]);
  }

  async getComentariosTotales(desde: Date, hasta: Date) {
    const cantidad = await this.comentarioModel.countDocuments({
        createdAt: { $gte: desde, $lte: hasta }
    });
    return { cantidad };
  }
  
  // Gráfico de Líneas: Comentarios recibidos POR PUBLICACIÓN
  async getComentariosPorPublicacion(desde: Date, hasta: Date) {
      return this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta }
        },
      },
      {
        $group: {
          _id: '$publicacionId', 
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: { 
          from: 'publicacions', 
          localField: '_id',
          foreignField: '_id',
          as: 'pubInfo',
        },
      },
      { $unwind: '$pubInfo' },
      {
        $project: {
          tituloPublicacion: '$pubInfo.titulo',
          cantidad: 1,
        },
      },
    ]);
  }
}