import { Module } from '@nestjs/common';
import { IFileManager } from './file-manager.interface';
import { LocalFileManagerService } from './file-manager.service';

@Module({
  providers:[
    {
      provide: IFileManager,
      useClass: LocalFileManagerService
    }
  ],
  exports:[
    IFileManager
  ]
})
export class FileManagerModule {}
