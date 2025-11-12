import { IsDate, IsDefined, IsEmail, IsString } from "class-validator";

export class CredencialesDTO {
  @IsEmail()
  @IsDefined()
  correo:string;

  @IsString()
  @IsDefined()
  contrasenia:string;
  
}
