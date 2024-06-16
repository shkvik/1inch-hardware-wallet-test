import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { 
  ApiBody, 
  ApiConsumes, 
  ApiOperation, 
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
import { deleteSummary, getSummary, postDescription, postSummary } from 'src/constants/constants';

@Controller()
@ApiTags('Files')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(`public/:version`)
  @ApiParam({ name: 'version'})
  @ApiQuery({ name: 'name', required: true })
  @ApiOperation({ summary: getSummary })
  public async getFile(
    @Param() params: FileParam,
    @Query() queries: FileQueries,
    @Res() res: Response
  ): Promise<void> {
    return res.sendFile(await this.appService.getFile(params, queries))
  }

  @Delete(`private/:version`)
  @ApiParam({ name: 'version'})
  @ApiQuery({ name: 'name', required: true })
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  @ApiOperation({ summary: deleteSummary })
  public async deleteFile(
    @Param() params: FileParam,
    @Query() queries: FileQueries
  ): Promise<string> {
    return this.appService.deleteFile(params, queries);
  }

  @Post(`private`)
  @ApiSecurity(`access-key`)
  @UseGuards(FileGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody(API_BODY)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: postSummary, description: postDescription })
  public async uploadFile(
    @FileRequired() file: Express.Multer.File
  ): Promise<string> {
    return this.appService.uploadFile(file);
  }
}
