FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY . .

RUN npm run build financial-management

EXPOSE 3003

CMD ["node", "dist/apps/financial-management/main"]
