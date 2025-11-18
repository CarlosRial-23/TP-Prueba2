import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Publicacion } from './publicacione.entity';

@Schema({ timestamps: true })
export class Comentario extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: Usuario; // Quién comentó

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Publicacion', required: true })
  publicacion: Publicacion; // En qué publicación

  @Prop({ required: true })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean; // Para saber si fue editado

  @Prop({ default: true }) 
  activo: boolean; // Por si necesitas borrado lógico
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);