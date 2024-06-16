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

## Docker
```bash
# Build container
$ docker build -t 1inch_test .

# run image
$ docker run -d -p 3000:3000 --name 1inch_container \
  -e APP_PORT=3000 \
  -e DOMAIN=http://localhost: \
  -e SWAGGER_PATH=docs \
  -e SECRET_TOKEN=123 \
  1inch_test
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

### FileManager 
In the current state, the application is working with the host storage. This is a temporary solution, if you are going to develop the service, then you need to switch to S3 type storage, for example. We need the ability to smoothly replace, so we need an interface that fulfil the requirements with the ability to replace.
```ts
export abstract class IFileManager {
  abstract get(fileName: string, version?: number): Promise<string>;
  abstract delete(fileName: string, version?: number): Promise<string>;
  abstract upload(file: Express.Multer.File): Promise<string>;
}
```
Now files are saved with the version indicated at the beginning of the name.
```
testFile.txt => v1_testFile.txt => v2_testFile.txt => v3_testFile.txt
```
To work with the search for files in this format, a method is used with the search and sorting of versions
```ts
export class LocalFileManagerService extends IFileManager {
  private async getVersionFiles(fileName: string, version?: number): Promise<string[]>{
    const files = await readdir(join(this.filesPath));
    const filteredFiles = files.filter(file => {
      return this.getPureNameFromFileName(file) === fileName;
    });
    filteredFiles.sort((a,b)=>{
      return this.getVersionFromFileName(a) - this.getVersionFromFileName(b);
    }) 
    if(version){
      const findedVersion = filteredFiles.find(
        file => this.getVersionFromFileName(file) === version
      );
      return findedVersion ? [findedVersion] : [];
    }
    return filteredFiles;
  }

  private getPureNameFromFileName(fileName: string): string {
    return fileName.slice(fileName.indexOf(`_`) + 1);
  }
  
  private getVersionFromFileName(fileName: string): number{
    return Number(fileName.substring(1, fileName.indexOf(`_`)));
  }
}
```
#### How improve?
This will work well as long as there are not very many files in the storage, but later the speed will start to sink. If we imagine that we will not switch to cloud storage and use third-party databases, that this solution can be improved to increase the speed of search and sorting. To improve operations, you need to create a data structure based on the AVL tree, as well as add a hot start. When launching the application, you will need to update this data structure to warm up before searching, as well as monitor the deletion of versions and files.

### Tests
1. Just upload file
2. Upload file, when hashsum equals previos version
3. Upload and update file
4. Upload files with difficult names
5. Just delete file without version
6. Just delete file with version
7. Try delete not existing file name
8. Try delete not existing file version
9. Get file without version
10. Get file with version
11. Get not existing file
12. Get not existing file version
![image](https://github.com/shkvik/1inch-hardware-wallet-test/assets/75574213/0da7a51a-cc14-4472-83c4-7570548038dd)
