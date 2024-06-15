import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IFileManager } from './file-manager.interface';
import { writeFile, readdir, readFile } from 'fs-extra';
import { createHash } from 'crypto';
import { join } from 'path';

type File = Express.Multer.File;

const filePath = `files`

@Injectable()
export class LocalFileManager extends IFileManager {
  private readonly logger = new Logger(LocalFileManager.name);
  
  public override async upload(file: File): Promise<void> {
    let fileName = '';
    const files = await this.getVersionFiles(file.originalname);
    if(files.length > 0){
      const res = files[files.length - 1];
      const lastVersion = await readFile(join(filePath,res));
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
      await writeFile(join(filePath, fileName), file.buffer);
    }
    catch(err){
      this.logger.error(err.message);
    }
  }

  public override async read(fileName: string, version?: number): Promise<string> {
    const files = await this.getVersionFiles(fileName, version);
    if(files.length === 0){
      throw new BadRequestException(`File doesn't existing`);
    }
    return `${process.cwd()}/${filePath}/${files[files.length - 1]}`;
  }

  public override async delete(fileName: string, version?: number): Promise<void> {
    
  }

  private async getVersionFiles(fileName: string, version?: number): Promise<string[]>{
    const files = await readdir(join(filePath));
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