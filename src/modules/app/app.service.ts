import { Injectable } from '@nestjs/common';
import { IFileManager } from '../file-manager/file-manager.interface';
import { FileParam, FileQueries } from './dto/file.params.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly fileManager: IFileManager
  ) {}

  public async getFile(params: FileParam, queries: FileQueries) {
    const { name } = params;
    const { version } = queries;
    return this.fileManager.read(name, version);
  }

  public async deleteFile(){
    
  }

  public async uploadFile(file: Express.Multer.File){
    await this.fileManager.upload(file);
  }
}
