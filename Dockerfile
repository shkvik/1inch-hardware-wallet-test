# syntax=docker/dockerfile:1
FROM node:21.7.3-slim
WORKDIR /usr/src/app
COPY . .
RUN npm install && npm run build

FROM node:21.7.3-slim
WORKDIR /usr/src/app
COPY --from=0 /usr/src/app/ ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]