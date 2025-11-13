import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Schema({ timestamps: true }) 
export class Publicacion extends Document {

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: Usuario;

  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop()
  urlImagen?: string; // Opcional

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Usuario' }], default: [] })
  meGusta: Usuario[]; 

  @Prop({ default: true })
  activa: boolean; 
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
