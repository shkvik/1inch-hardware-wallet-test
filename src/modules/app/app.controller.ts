import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { FileGuard } from 'src/guards/base.guard';
import { FileRequired } from './utils/file.decorator';
import { API_BODY } from './swagger/upload.swagger';
import { FileParam, FileQueries } from './dto/file.params.dto';

@Controller('file')
@ApiTags('Files')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(`:name`)
  @ApiParam({ name: 'name', required: true })
  @ApiQuery({ name: 'version', required: false })
  public async getFile(
    @Param() params: FileParam,
    @Query() queries: FileQueries,
    @Res() res: Response) {
    const filePath = await this.appService.getFile(params, queries);
    return res.sendFile(filePath)
  }

  @Delete(`/:name/:?version`)
  @ApiParam({ name: 'name', required: false })
  @ApiParam({ name: 'version', required: false })
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  public async deleteFile(
    @Param() params: FileParam,
    @Query() queries: FileQueries,
    @Req() req: Request
  ) {
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
