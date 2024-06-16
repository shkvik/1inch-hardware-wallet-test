export const swaggerDescription = `
## Description
Test task:
1. Create a Nest.js application that should has public and private endpoints.
2. Private endpoints should be protected by auth method.
3. Public endpoint allows to read the data and private allows to write data.
4. The application should be dockerized.

### POST /private
This endpoint should accept any binary image and move it into file storage

Requirements:
- The file must be versioned
- History of file changes should be kept

### DELETE /private/:version
This endpoint should delete file from the storage by provided version

### GET /public/:version
This endpoint should respond with the file data

#### Evaluation criteria:
- Clean code, which is self documented
- Code structure, design
- Tests, documentation
- Your application should works
`