import { Injectable } from '@nestjs/common';
import { IFileManager } from '../file-manager/file-manager.interface';
import { FileParam, FileQueries } from './dto/file.params.dto';

@Injectable()
export class AppService {
  constructor(private readonly fileManager: IFileManager) {}
    
  public async getFile(params: FileParam, queries: FileQueries): Promise<string> {
    return this.fileManager.get(params.name, queries.version);
  }

  public async deleteFile(params: FileParam, queries: FileQueries): Promise<string>{
    const deletedFileName = await this.fileManager.delete(params.name, queries.version);
    return `Success deleting file ${deletedFileName}`;
  }

  public async uploadFile(file: Express.Multer.File): Promise<string> {
    const uploadedFileName = await this.fileManager.upload(file);
    return `Success uploaded file ${uploadedFileName}`;
  }
}
