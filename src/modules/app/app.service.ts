import { Injectable } from '@nestjs/common';
import { IFileManager } from '../file-manager/file-manager.interface';

@Injectable()
export class AppService {
  constructor(
    private readonly fileManager: IFileManager
  ) {}

  public async getFile(){

  }

  public async deleteFile(){

  }

  public async uploadFile(file: Express.Multer.File){
    await this.fileManager.upload(file);
  }
}
