import {
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
import { 
  ApiBody, 
  ApiConsumes, 
  ApiParam, 
  ApiQuery, 
  ApiSecurity, 
  ApiTags
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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
    @Res() res: Response
  ): Promise<void> {
    return res.sendFile(await this.appService.getFile(params, queries))
  }

  @Delete(`:name`)
  @ApiParam({ name: 'name', required: true })
  @ApiQuery({ name: 'version', required: false })
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  public async deleteFile(
    @Param() params: FileParam,
    @Query() queries: FileQueries
  ): Promise<string> {
    return this.appService.deleteFile(params, queries);
  }

  @Post()
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody(API_BODY)
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@FileRequired() file: Express.Multer.File): Promise<string> {
    return this.appService.uploadFile(file);
  }
}
