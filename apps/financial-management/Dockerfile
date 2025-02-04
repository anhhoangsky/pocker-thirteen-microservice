FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

RUN npm install

COPY apps/financial-management ./apps/financial-management
COPY libs ./libs

RUN npm run build financial-management

EXPOSE 3003

CMD ["npm", "run", "start:prod", "financial-management"]