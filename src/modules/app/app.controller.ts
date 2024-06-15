import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { AppService } from './app.service';
import { FileGuard } from 'src/guards/base.guard';
import { FileRequired } from './utils/file.decorator';
import { API_BODY } from './swagger/upload.swagger';
import { FileParams } from './dto/file.params.dto';

@Controller('file')
@ApiTags('Files')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(`/:name/:version`)
  @ApiParam({ name: 'name', required: true })
  @ApiParam({ name: 'version', required: false })
  public async getFile(@Param() params: FileParams, @Req() req: Request) {
    return true;
  }

  @Delete(`/:name/:version`)
  @ApiParam({ name: 'name', required: false })
  @ApiParam({ name: 'version', required: false })
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  public async deleteFile(@Param() params: FileParams, @Req() req: Request ) {
    return true;
  }

  @Post()
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody(API_BODY)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@FileRequired() file: Express.Multer.File) {
    return this.appService.uploadFile(file);
  }
}
