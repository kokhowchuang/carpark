FROM node:lts As development
COPY package.json ./

RUN npm install

COPY . ./

ARG PORT=3000

EXPOSE $PORT