FROM node:20-bookworm as dep

WORKDIR /app
COPY . .

RUN npm install -g bun &&\
    npm install -g pnpm

RUN pnpm install
EXPOSE 3000

WORKDIR /app/packages/db
CMD ["bun", "migrate"]
