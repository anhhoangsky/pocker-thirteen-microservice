FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY . .

RUN npm run build game-management

EXPOSE 3002

CMD ["node", "dist/apps/game-management/main"]
