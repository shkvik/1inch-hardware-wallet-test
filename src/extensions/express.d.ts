import { Request } from 'src/extensions/express';

declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: string;
  }
}