import { 
  createParamDecorator, 
  ExecutionContext, 
  BadRequestException
} from '@nestjs/common';

export const FileRequired = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const file = request.file;
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return file;
  },
);