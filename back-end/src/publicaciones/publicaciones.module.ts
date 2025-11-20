import { Module } from '@nestjs/common';
import { PublicacionesService } from './publicaciones.service';
import { PublicacionesController } from './publicaciones.controller';
import { ComentariosController } from './comentarios.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Publicacion, PublicacionSchema } from './entities/publicacione.entity';
import { Comentario, ComentarioSchema } from './entities/comentario.entity';
import { ComentariosService } from './comentarios.service';
import { EstadisticasController } from './estadisticas.controller'; 
import { EstadisticasService } from './estadisticas.service'; 
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
      { name: Comentario.name, schema: ComentarioSchema },
    ]),
    AuthModule
  ],
  controllers: [
    PublicacionesController, 
    ComentariosController,
    EstadisticasController
  ],
  providers: [
    PublicacionesService , 
    ComentariosService,
    EstadisticasService
  ],
  exports: [PublicacionesService],
})
export class PublicacionesModule {}
