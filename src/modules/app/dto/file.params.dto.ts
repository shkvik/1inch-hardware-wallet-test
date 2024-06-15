import { 
  IsInt, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Min
} from 'class-validator';
import { Transform } from 'class-transformer';


export class FileParam {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class FileQueries{
  @IsOptional()
  @Transform(({ value }) => convertToNumber(value))
  @IsInt()
  @Min(1)
  version?: number;
}

function convertToNumber(value: any){
  return value === '' || value === null || value === undefined ? undefined : Number(value);
}