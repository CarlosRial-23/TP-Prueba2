import { Type } from 'class-transformer';
import { IsDate, IsDefined, IsEmail, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateUsuarioDto {

    @IsString()
    @IsDefined()
    nombre:string;

    @IsString()
    @IsDefined()
    apellido:string;

    @IsEmail()
    @IsDefined()
    correo:string;

    @IsString()
    @IsDefined()
    nombreUsuario:string;

    @IsString()
    @IsDefined()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
        message: 'La contraseña debe tener al menos una mayúscula y un número',
    })
    contrasenia: string;

    @IsDate()
    @Type(() => Date)
    fechaNacimiento:Date;

    @IsString()
    @IsDefined()
    descripcion:string;

    @IsOptional()
    @IsString()
    @IsDefined()
    perfil?:string;

}
