export abstract class IFileManager {
  abstract get(fileName: string, version?: number): Promise<string>;
  abstract delete(fileName: string, version?: number): Promise<string>;
  abstract upload(file: Express.Multer.File): Promise<string>;
}