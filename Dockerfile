FROM node:20-alpine

# 装 vgmstream
RUN apk add --no-cache vgmstream

WORKDIR /app

COPY package.json ./
RUN npm install --production

COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
