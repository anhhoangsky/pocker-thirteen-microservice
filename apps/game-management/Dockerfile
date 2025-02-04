FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY apps/game-management ./apps/game-management
COPY libs ./libs

RUN npm run build game-management

EXPOSE 3002

CMD ["npm", "run", "start:prod", "game-management"]