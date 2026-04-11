FROM node:24-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json package-lock.json* ./

RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 5001

CMD ["npm", "run", "dev"]
