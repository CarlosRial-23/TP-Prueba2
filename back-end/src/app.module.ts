import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicacionesModule } from './publicaciones/publicaciones.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [PublicacionesModule, AuthModule, UsuariosModule,ConfigModule.forRoot(),MongooseModule.forRoot(process.env.MONGODB_URI!)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
