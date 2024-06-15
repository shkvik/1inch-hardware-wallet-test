export abstract class IFileManager {
  abstract upload(file: Express.Multer.File): Promise<void>;
  abstract read(file: Express.Multer.File): Promise<void>;
  abstract delete(file: Express.Multer.File): Promise<void>;
}