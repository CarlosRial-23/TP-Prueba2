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
          cantidad: { $sum: 1 },
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

  async getComentariosPorUsuario(desde: Date, hasta: Date) {
    return this.comentarioModel.aggregate([
      {
        $match: {
          createdAt: { $gte: desde, $lte: hasta }
        },
      },
      {
        $group: {
          _id: '$autor', 
          cantidad: { $sum: 1 },
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

  async getComentariosTotales(desde: Date, hasta: Date) {
    const cantidad = await this.comentarioModel.countDocuments({
        createdAt: { $gte: desde, $lte: hasta }
    });
    return { cantidad };
  }
  
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