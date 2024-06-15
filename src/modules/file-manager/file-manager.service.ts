import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IFileManager } from './file-manager.interface';
import { writeFile, readdir, readFile, remove } from 'fs-extra';
import { createHash } from 'crypto';
import { join } from 'path';

type File = Express.Multer.File;

const filesPath = `files`

@Injectable()
export class LocalFileManager extends IFileManager {
  private readonly logger = new Logger(LocalFileManager.name);
  
  public override async upload(file: File): Promise<string> {
    let fileName = '';
    const files = await this.getVersionFiles(file.originalname);
    if(files.length > 0){
      const res = files[files.length - 1];
      const lastVersion = await readFile(join(filesPath,res));
      const [hashA, hashB] = await Promise.all([
        this.computeFileHash(file.buffer),
        this.computeFileHash(lastVersion)
      ]);
      if(hashA === hashB){
        return;
      }
      const index = res.indexOf(`_`);
      const result = Number(res.substring(1, index)) + 1;
      fileName = `v${result}_${file.originalname}`;
    }
    else{
      fileName = `v1_${file.originalname}`;
    }
    try {
      await writeFile(join(filesPath, fileName), file.buffer);
      return fileName;
    }
    catch(err){
      this.logger.error(err.message);
    }
  }

  public override async get(fileName: string, version?: number): Promise<string> {
    const files = await this.getVersionFiles(fileName, version);
    if(files.length === 0){
      throw new BadRequestException(`File doesn't existing`);
    }
    return `${process.cwd()}/${filesPath}/${files[files.length - 1]}`;
  }

  public override async delete(fileName: string, version?: number): Promise<string> {
    const files = await this.getVersionFiles(fileName, version);
    if(files.length === 0){
      throw new BadRequestException(`File doesn't existing`);
    }
    const filePath = files[files.length - 1];
    await remove(`${process.cwd()}/${filePath}/${filePath}`);
    return filePath;
  }

  private async getVersionFiles(fileName: string, version?: number): Promise<string[]>{
    const files = await readdir(join(filesPath));
    const filteredFiles = files.filter(file => file.includes(fileName, 3));
    if(version){
      const findedVersion = files.find(
        file => Number(file.substring(1, file.indexOf(`_`))) === version
      );
      return findedVersion ? [findedVersion] : [];
    }
    return filteredFiles;
  }

  private async computeFileHash(buffer: Buffer): Promise<string> {
    const hashSum = createHash('sha256')
    hashSum.update(buffer);
    const hex = hashSum.digest('hex');
    return hex;
  }
}