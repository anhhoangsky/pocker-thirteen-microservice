FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY apps/telegram-bot ./apps/telegram-bot
COPY libs ./libs

RUN npm run build telegram-bot

EXPOSE 3001

CMD ["npm", "run", "start:prod", "telegram-bot"]