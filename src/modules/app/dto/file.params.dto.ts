import { Transform } from 'class-transformer';
import { IsEmpty, IsInt, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FileParam {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class FileQueries{
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsInt()
  version?: number;
}