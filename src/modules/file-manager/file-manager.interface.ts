export abstract class IFileManager {
  abstract upload(file: Express.Multer.File): Promise<void>;
  abstract read(fileName: string, version?: number): Promise<string>;
  abstract delete(fileName: string, version?: number): Promise<void>;
}