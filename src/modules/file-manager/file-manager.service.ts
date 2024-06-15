import { Injectable } from '@nestjs/common';
import { IFileManager } from './file-manager.interface';
import { access, writeFile, readdir } from 'fs-extra';
import { join } from 'path';


const filePath = `files`

@Injectable()
export class LocalFileManager extends IFileManager {

  public override async upload(file: Express.Multer.File): Promise<void> {
    await this.getVersionsFile(file.originalname);
    
    const path = join(filePath, file.originalname);
    const isExists = await this.isFileExist(path);
    if(!isExists){
      await writeFile(path, file.buffer);
    }
  }

  public override async read(file: Express.Multer.File): Promise<void> {
    // Реализация метода чтения файла
  }

  public override async delete(file: Express.Multer.File): Promise<void> {
    // Реализация метода удаления файла
  }

  private async isFileExist(filePath: string): Promise<boolean> {
    try{

      await access(filePath);
      return true;
    }
    catch(err){
      return false;
    }
  }
  private async getVersionsFile(fileOriginalName: string){
    try {
      const files = await readdir(join(filePath));
      return files.some(file => file.includes(fileOriginalName));
    } catch (err) {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    }
  }
  private async getLastVersion(){

  }
}