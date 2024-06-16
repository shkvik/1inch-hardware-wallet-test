import { 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Min
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FileParam {
  @IsOptional()
  @Transform(({ value }) => convertToNumber(value))
  @IsInt()
  @Min(1)
  version?: number;
}

export class FileQueries{
  @IsString()
  @IsNotEmpty()
  name: string;
}

function convertToNumber(value: any){
  return value === '' || value === null || value === undefined ? undefined : Number(value);
}