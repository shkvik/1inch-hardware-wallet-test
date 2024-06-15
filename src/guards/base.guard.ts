import { Request } from 'express';
import { 
  Injectable, 
  CanActivate, 
  ExecutionContext
} from '@nestjs/common';

@Injectable()
export class FileGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers['x-api-key'];
    return authorizationHeader !== process.env.SECRET_TOKEN ? false : true;
  }
}
