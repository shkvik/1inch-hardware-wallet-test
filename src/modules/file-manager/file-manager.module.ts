import { Module } from '@nestjs/common';
import { IFileManager } from './file-manager.interface';
import { LocalFileManager } from './file-manager.service';

@Module({
  providers:[
    {
      provide: IFileManager,
      useClass: LocalFileManager
    }
  ],
  exports:[
    IFileManager
  ]
})
export class FileManagerModule {}
