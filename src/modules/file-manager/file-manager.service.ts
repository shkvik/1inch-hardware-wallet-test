import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IFileManager } from './file-manager.interface';
import { writeFile, readdir, readFile, remove } from 'fs-extra';
import { createHash } from 'crypto';
import { join } from 'path';

type File = Express.Multer.File;

@Injectable()
export class LocalFileManagerService extends IFileManager {
  private readonly filesPath = `files`;
  private readonly logger = new Logger(LocalFileManagerService.name);
  
  public override async upload(file: File): Promise<string> {
    let fileName = `v1_${file.originalname}`;
    const files = await this.getVersionFiles(file.originalname);
    if(files.length > 0){
      const lastVersionFileName = files[files.length - 1];
      const lastVersionFileBin = await readFile(
        join(this.filesPath, lastVersionFileName)
      );
      const [hashA, hashB] = await Promise.all([
        this.computeFileHash(file.buffer),
        this.computeFileHash(lastVersionFileBin)
      ]);
      if(hashA === hashB){
        throw new BadRequestException(
          `${file.originalname} hasn't any changes!`
        );
      }
      const nextVersion = this.getVersionFromFileName(lastVersionFileName) + 1;
      fileName = `v${nextVersion}_${file.originalname}`;
    }
    try {
      await writeFile(join(this.filesPath, fileName), file.buffer);
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
    return `${process.cwd()}/${this.filesPath}/${files[files.length - 1]}`;
  }

  public override async delete(fileName: string, version?: number): Promise<string> {
    const files = await this.getVersionFiles(fileName, version);
    if(files.length === 0){
      throw new BadRequestException(`File doesn't existing`);
    }
    const filePath = files[files.length - 1];
    await remove(`${process.cwd()}/${this.filesPath}/${filePath}`);
    return filePath;
  }

  private async getVersionFiles(fileName: string, version?: number): Promise<string[]>{
    const files = await readdir(join(this.filesPath));
    const filteredFiles = files.filter(file => {
      return this.getPureNameFromFileName(file) === fileName;
    });
    filteredFiles.sort((a,b)=>{
      return this.getVersionFromFileName(a) - this.getVersionFromFileName(b);
    }) 
    if(version){
      const findedVersion = filteredFiles.find(
        file => this.getVersionFromFileName(file) === version
      );
      return findedVersion ? [findedVersion] : [];
    }
    return filteredFiles;
  }

  private getPureNameFromFileName(fileName: string): string {
    return fileName.slice(fileName.indexOf(`_`) + 1);
  }
  
  private getVersionFromFileName(fileName: string): number{
    return Number(fileName.substring(1, fileName.indexOf(`_`)));
  }

  private async computeFileHash(buffer: Buffer): Promise<string> {
    const hashSum = createHash('sha256')
    hashSum.update(buffer);
    const hex = hashSum.digest('hex');
    return hex;
  }
}