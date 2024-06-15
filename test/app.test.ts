import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileManagerService } from 'src/modules/file-manager/file-manager.service';
import { IFileManager } from 'src/modules/file-manager/file-manager.interface';
import { Readable } from 'stream';
import { remove, exists, readdir } from 'fs-extra';
import { BadRequestException } from '@nestjs/common';
import { basename } from 'path';

const filesPath = 'test/files';
async function deleteTestFiles(){
  const path = `${process.cwd()}/${filesPath}`;
  const files = await readdir(path);
  const tasks = files.map(async file => {
    await remove(`${path}/${file}`);
  })
  await Promise.all(tasks);
}

describe('Services', () => {

  let serv: IFileManager;

  describe(`FileManager`, () => {
    let testFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'testfile.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 1024,
      destination: './uploads',
      filename: 'testfile.txt',
      path: './uploads/testfile.txt',
      buffer: Buffer.from('This is a test file'),
      stream: new Readable({
        read() {
          this.push('This is a test file');
          this.push(null);
        }
      })
    };
    let filesForDelete: string[] = [];
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: IFileManager,
            useClass: LocalFileManagerService
          }
        ],
      }).compile();
      serv = module.get<IFileManager>(IFileManager);
      serv['filesPath'] = 'test/files';
      filesForDelete = [];
      await deleteTestFiles();
      
    });
    
    it('[success] just upload file', async () => {
      const result = await serv.upload(testFile);
      expect(result).toEqual(`v1_${testFile.originalname}`);
    });

    it('[success] upload file, when hashsum equals previos version', async () => {
      const fileOne = await serv.upload(testFile);
      const fileTwo = await serv.upload(testFile);

      expect(fileOne).toEqual(`v1_${testFile.originalname}`);
      expect(fileTwo).toBeUndefined();
    });

    it('[success] upload and update file', async () => {
      const testCount = 20;
      for(let i = 0; i < testCount; i++){
        await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
      }
      const path = `${process.cwd()}/${filesPath}`;
      const files = await readdir(path);
      const uniques = new Set(files);

      expect(files.length).toEqual(uniques.size);
      expect(files.length).toEqual(testCount);
    });

    it('[success] upload files with difficult names', async () => {
      const difficultNames = ['v1', 'v2_', 'v_2_v3', '____2', '1', '2', '3', '4'];

      for(const name of difficultNames.values()){
        testFile.originalname = name;
        await serv.upload(testFile);
      }

      const path = `${process.cwd()}/${filesPath}`;
      const files = await readdir(path);
      const uniques = new Set(files);

      expect(files.length).toEqual(uniques.size);
      expect(files.length).toEqual(difficultNames.length);
    });

    it('[success] just delete file without version', async () => {
      const files: string[] = [];
      for(let i = 0; i < 10; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        files.push(fileName);
      }
      const deletedFile = await serv.delete(testFile.originalname);

      expect(deletedFile).toEqual(files[files.length - 1]);
    });

    it('[success] just delete file with version', async () => {
      const targetVersion = 1;
      const files: string[] = [];
      for(let i = 0; i < 10; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        files.push(fileName);
      }
      const deletedFile = await serv.delete(testFile.originalname, targetVersion);
      expect(deletedFile).toEqual(files[0]);
    });

    it('[failed] try delete not existing file name', async () => {
      await expect(async () => {
        await serv.delete(testFile.originalname);
      }).rejects.toThrow(
        new BadRequestException(`File doesn't existing`)
      );
    });

    it('[failed] try delete not existing file version', async () => {
      const files: string[] = [];
      for(let i = 0; i < 3; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        files.push(fileName);
      }

      await expect(async () => {
        await serv.delete(testFile.originalname, 11);
      }).rejects.toThrow(
        new BadRequestException(`File doesn't existing`)
      );
    });

    it('[success] get file without version', async () => {
      const files: string[] = [];
      for(let i = 0; i < 10; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        files.push(fileName);
      }
      const result = await serv.get(testFile.originalname);
      expect(basename(result)).toEqual(`v10_${testFile.originalname}`);
    });

    it('[success] get file with version', async () => {
      const targetVersion = 7;
      const files: string[] = [];
      for(let i = 0; i < 10; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        files.push(fileName);
      }
      const result = await serv.get(testFile.originalname, targetVersion);
      expect(basename(result))
        .toEqual(`v${targetVersion}_${testFile.originalname}`);
    });

    it('[failed] get not existing file', async () => {
      await expect(async () => {
        await serv.get(testFile.originalname);
      }).rejects.toThrow(
        new BadRequestException(`File doesn't existing`)
      );
    });

    it('[failed] get not existing file version', async () => {
      const files: string[] = [];
      for(let i = 0; i < 10; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        files.push(fileName);
      }

      await expect(async () => {
        await serv.get(testFile.originalname, 12);
      }).rejects.toThrow(
        new BadRequestException(`File doesn't existing`)
      );
    });

    afterEach( async () => {
      await deleteTestFiles();
    });
  });
});
