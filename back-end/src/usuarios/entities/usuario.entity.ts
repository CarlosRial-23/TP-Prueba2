import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose ,{ type ObjectId } from 'mongoose';


@Schema()
export class Usuario {

    @Prop({required:true})
    nombre:string;
    @Prop({required:true})
    apellido:string;
    @Prop({required:true, unique: true})
    correo:string;
    @Prop({required:true})
    nombreUsuario:string;
    @Prop({required:true})
    contrasenia:string;
    @Prop({required:true})
    fechaNacimiento:Date;
    @Prop({required:true})
    descripcion:string;
    @Prop({default:"usuario"})
    perfil:string;
    @Prop({default:null})
    urlFoto:string;
    @Prop({ default: true })
    activo: boolean;

}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);
