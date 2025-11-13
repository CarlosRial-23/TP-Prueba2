import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { ComentariosController } from './comentarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './entities/publicacione.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
  ],
  controllers: [PublicacionesController, ComentariosController],
  providers: [PublicacionesService],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}
