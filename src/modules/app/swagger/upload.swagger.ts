import { ApiBodyOptions } from "@nestjs/swagger";

export const API_BODY: ApiBodyOptions = {
  required: true,
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
    required: [`file`]
  },
}