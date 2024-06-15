import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileManagerService } from 'src/modules/file-manager/file-manager.service';
import { IFileManager } from 'src/modules/file-manager/file-manager.interface';
import { Readable } from 'stream';
import { remove, exists } from 'fs-extra';

describe('Services', () => {
  let filesPath = 'test/files';
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
    });
    
    it('[success] just upload file', async () => {
      const result = await serv.upload(testFile);
      filesForDelete.push(result);
    });

    it('[success] upload file, when hashsum equals previos version', async () => {
      const fileOne = await serv.upload(testFile);
      const fileTwo = await serv.upload(testFile);
      filesForDelete.push(fileOne);
    });

    it('[success] upload and update file', async () => {
      for(let i = 0; i < 10; i++){
        const fileName = await serv.upload(testFile);
        testFile.buffer = Buffer.from(`Now it ${i} version`);
        filesForDelete.push(fileName);
      }
    });

    it('[success] upload files with difficult names', async () => {
      const difficultNames = ['v1', 'v2_', 'v_2_v3', '____2', '1', '2', '3', '4'];
        
      for(const name of difficultNames.values()){
        testFile.originalname = name;
        if(name === '1'){
          console.log(1);
        }
        const fileName = await serv.upload(testFile);
        filesForDelete.push(fileName);
      }
      const a = 0;
    });

    it('[success] get file without version', async () => {
      const result = await serv.get('1');
    });

    it('[success] get file with version', async () => {
      const result = await serv.get('1');
    });

    it('[failed] get file without version', async () => {
      const result = await serv.get('1');
    });

    it('[failed] get file with version', async () => {
      const result = await serv.get('1');
    });

    afterEach( async () => {
      if(filesForDelete.length > 0){
        filesForDelete.forEach(async fileName => {
          const filePath = `${process.cwd()}/${filesPath}/${fileName}`;
          const isExist = await exists(filePath);
          if(isExist){
            remove(filePath)
          }
        })
      }
    });
  });
});
