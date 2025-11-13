import { IsString, MinLength, IsOptional } from 'class-validator';

export class CreatePublicacioneDto {
  @IsString()
  @MinLength(5)
  titulo: string;

  @IsString()
  @MinLength(10)
  descripcion: string;

  @IsOptional()
  @IsString() 
  urlImagen?: string;
}
