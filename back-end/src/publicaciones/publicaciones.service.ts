import { UpdatePublicacioneDto } from './dto/update-publicacione.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreatePublicacioneDto } from './dto/create-publicacione.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Publicacion } from './entities/publicacione.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
  ) {}

  async create(createPublicacioneDto: CreatePublicacioneDto, userId: string) {
    const publicacionNueva = new this.publicacionModel({
      ...createPublicacioneDto,
      autor: userId, 
    });
    await publicacionNueva.save();
    return publicacionNueva;
  }

  async findAll(
    limit: number = 10,
    offset: number = 0,
    orden: 'fecha' | 'likes' = 'fecha',
    autorId?: string,
  ) {
    const filtros: any = { activa: true }; 

    // 1. Filtro por autor (para "Mi Perfil")
    if (autorId) {
      filtros.autor = autorId;
    }

    // 2. Ordenamiento
    let sortOptions: any;
    if (orden === 'likes') {
      // Para ordenar por 'likes', debemos usar aggregation para contar el array
      return this.findAllSortedByLikes(filtros, limit, offset);
    } else {
      // Orden por fecha (defecto)
      sortOptions = { createdAt: -1 }; // -1 = descendente
    }

    const publicaciones = await this.publicacionModel
      .find(filtros)
      .populate('autor', 'nombreUsuario urlFoto') 
      .sort(sortOptions)
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await this.publicacionModel.countDocuments(filtros);
    return { publicaciones, total };
  }

  async findOne(id: string) {
    const publicacion = await this.publicacionModel
      .findById(id)
      .populate('autor', 'nombreUsuario urlFoto')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    
    return publicacion;
  }

  private async findAllSortedByLikes(filtros: any, limit: number, offset: number) {
    const publicaciones = await this.publicacionModel.aggregate([
      { $match: filtros }, 
      {
        $addFields: {
          meGustaCount: { $size: '$meGusta' },
        },
      },
      { $sort: { meGustaCount: -1, createdAt: -1 } }, 
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: 'usuarios', 
          localField: 'autor',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' }, 
      {
        $project: {
          'autor.contrasenia': 0,
          'autor.correo': 0,
          'autor.fechaNacimiento': 0,
          'autor.descripcion': 0,
          'autor.activa': 0,
        },
      },
    ]);

    const total = await this.publicacionModel.countDocuments(filtros);
    return { publicaciones, total };
  }

  async remove(id: string, userId: string, userRole: string) {
    const publicacion = await this.publicacionModel.findById(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    if (publicacion.autor.toString() !== userId && userRole !== 'administrador') {
      throw new UnauthorizedException('No tienes permiso para borrar esta publicación');
    }

    publicacion.activa = false; 
    await publicacion.save();
    return { message: 'Publicación eliminada (baja lógica)' };
  }

  async like(publicacionId: string, userId: string) {
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $addToSet: { meGusta: new Types.ObjectId(userId) } },
      { new: true }, 
    );

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }

  async unlike(publicacionId: string, userId: string) {
    const publicacion = await this.publicacionModel.findByIdAndUpdate(
      publicacionId,
      { $pull: { meGusta: new Types.ObjectId(userId) } },
      { new: true },
    );

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return publicacion;
  }
}
