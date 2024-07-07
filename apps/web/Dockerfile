FROM node:20

WORKDIR /app

COPY . .

RUN pnpm install &&\
    pnpm run build

EXPOSE 3000

WORKDIR /app/apps/web

ENV NODE_ENV production

CMD ["pnpm", "start"]
