# Dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY shared ./shared
COPY server ./server

RUN npm install

WORKDIR /app/server
RUN npm install
RUN npm run build

ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["npm", "start"]