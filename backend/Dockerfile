# ИСПОЛЬЗУЕМ DEBIAN SLIM ВМЕСТО ALPINE
# Это решает все проблемы с OpenSSL и отсутствующими библиотеками
FROM node:22-slim AS deps
WORKDIR /app

# Для Debian тоже нужен OpenSSL, но он там ставится без проблем одной командой
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm i --no-audit --no-fund

# -----------------------------------------------------------

FROM node:22-slim AS build
WORKDIR /app
ENV NODE_ENV=development

# Устанавливаем OpenSSL для генерации клиента
RUN apt-get update -y && apt-get install -y openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Генерируем клиент
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

# Чистим dev-зависимости
RUN npm prune --omit=dev

# -----------------------------------------------------------

# Stage для локальной разработки (если нужен)
FROM node:22-slim AS dev
WORKDIR /app
ENV NODE_ENV=development
RUN apt-get update -y && apt-get install -y openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["sh","-lc","npx prisma generate --schema=prisma/schema.prisma && npx prisma migrate deploy || true; node --loader ts-node/esm src/server.ts"]

# -----------------------------------------------------------

FROM node:22-slim AS prod
WORKDIR /app
ENV NODE_ENV=production

# Устанавливаем OpenSSL для рантайма
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated/prisma ./dist/generated/prisma

USER node
EXPOSE 3000

# Запускаем миграции и сервер
CMD ["sh","-lc","npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]
