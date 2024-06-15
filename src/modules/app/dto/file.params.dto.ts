import { IsNotEmpty, IsString } from 'class-validator';

export class FileParams {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  version: string;
}
