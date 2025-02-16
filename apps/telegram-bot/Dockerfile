FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY . .

RUN npm run build telegram-bot

EXPOSE 3001

CMD ["node", "dist/apps/telegram-bot/main"]
