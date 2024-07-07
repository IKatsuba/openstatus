FROM node:20

WORKDIR /app

COPY . .

RUN npm install -g pnpm
RUN pnpm install &&\
    pnpm run build

EXPOSE 3000

WORKDIR /app/apps/web

RUN echo $DATABASE_URL

CMD ["pnpm", "start"]
