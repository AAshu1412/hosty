FROM node:24-slim as builder

WORKDIR /hosty

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ARG VITE_GITHUB_CLIENT_ID
ARG VITE_SERVER_URL

ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID
ENV VITE_SERVER_URL=$VITE_SERVER_URL

RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /hosty/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]