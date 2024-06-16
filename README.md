# 1inch Hardware Wallet Test Task

1. Create a Nest.js application that should has public and private endpoints.
2. Private endpoints should be protected by auth method.
3. Public endpoint allows to read the data and private allows to write data.
4. The application should be dockerized.

**POST /private**\
This endpoint should accept any binary image and move it into file storage

Requirements:
- The file must be versioned
- History of file changes should be kept

**DELETE /private/:version**\
This endpoint should delete file from the storage by provided version

**GET /public/:version**\
This endpoint should respond with the file data

**Evaluation criteria:**
- Clean code, which is self documented
- Code structure, design
- Tests, documentation
- Your application should works

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
$ npm run test
```

## Solution 
The first thing that comes to mind, what if the files have different names? The application should not break if it encounters such a problem. To do this, you need to add the ability to address by name, but at the same time maintaining the conditions of the task

For convenient testing of the application, you can use swagger at http://localhost:3000/docs
![image](https://github.com/shkvik/1inch-hardware-wallet-test/assets/75574213/c919b43f-aeb8-4f91-b592-b2c288fe0c32)

### Upload Method
1. Upload method should accept any binary file with any name.
2. We need to check if this file already exists
3. If it exists, then we need to check that there are any changes in the file

We will compare the sha256 binary hash sum of the new version with the previous one\
Hence, we will record a new version of the file if there really are changes.

```ts
export class LocalFileManagerService extends IFileManager {

  private readonly logger = new Logger(LocalFileManagerService.name);

  public override async upload(file: File): Promise<string> {
    let fileName = `v1_${file.originalname}`;
    const files = await this.getVersionFiles(file.originalname);
    if(files.length > 0){
      const lastVersionFileName = files[files.length - 1];
      const lastVersionFileBin = await readFile(
        join(this.filesPath, lastVersionFileName)
      );
      const [hashA, hashB] = await Promise.all([
        this.computeFileHash(file.buffer),
        this.computeFileHash(lastVersionFileBin)
      ]);
      if(hashA === hashB){
        throw new BadRequestException(
          `${file.originalname} hasn't any changes!`
        );
      }
      const nextVersion = this.getVersionFromFileName(lastVersionFileName) + 1;
      fileName = `v${nextVersion}_${file.originalname}`;
    }
    try {
      await writeFile(join(this.filesPath, fileName), file.buffer);
      return fileName;
    }
    catch(err){
      this.logger.error(err.message);
    }
  }
}
```
### Get & Delete Methods
```ts
/* As for the test task
 * It is better to make the file name based on the request parameter, rather than the version, then it would be more logical
 * GET /public/:version => /public/:fileName?version=1
 * Because here you can extract the latest version of the file by the filename, if it is not explicitly specified
 */
```
1. These methods are the same in terms of search logic
2. Without specifying a specific version, we perform operations with the latest version

### Get
```ts
export class LocalFileManagerService extends IFileManager {
  public override async get(fileName: string, version?: number): Promise<string> {
    const files = await this.getVersionFiles(fileName, version);
    if(files.length === 0){
      throw new BadRequestException(`File doesn't existing`);
    }
    return `${process.cwd()}/${this.filesPath}/${files[files.length - 1]}`;
  }
}
```

### Delete
```ts
export class LocalFileManagerService extends IFileManager {
  public override async delete(fileName: string, version?: number): Promise<string> {
    const files = await this.getVersionFiles(fileName, version);
    if(files.length === 0){
      throw new BadRequestException(`File doesn't existing`);
    }
    const filePath = files[files.length - 1];
    await remove(`${process.cwd()}/${this.filesPath}/${filePath}`);
    return filePath;
  }
}
```
