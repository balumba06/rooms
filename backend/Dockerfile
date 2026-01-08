FROM node:24-alpine AS deps
WORKDIR /app
# Добавляем репозиторий, где есть пакет совместимости, и устанавливаем его
RUN apk add --no-cache openssl gcompat && \
    apk add --no-cache openssl1.1-compat --repository=https://dl-cdn.alpinelinux.org/alpine/v3.17/main

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm i --no-audit --no-fund


FROM node:24-alpine AS build
WORKDIR /app
ENV NODE_ENV=development
# То же самое здесь
RUN apk add --no-cache openssl gcompat && \
    apk add --no-cache openssl1.1-compat --repository=https://dl-cdn.alpinelinux.org/alpine/v3.17/main

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN ./node_modules/.bin/prisma generate --schema=prisma/schema.prisma
RUN npm run build
RUN npm prune --omit=dev


FROM node:24-alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
# И здесь
RUN apk add --no-cache openssl gcompat && \
    apk add --no-cache openssl1.1-compat --repository=https://dl-cdn.alpinelinux.org/alpine/v3.17/main

COPY --from=deps  /app/node_modules ./node_modules
COPY . .
CMD ["sh","-lc","npx prisma generate --schema=prisma/schema.prisma && npx prisma migrate deploy || true; node --loader ts-node/esm src/main.ts"]


FROM node:24-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
# И в продакшене
RUN apk add --no-cache openssl gcompat && \
    apk add --no-cache openssl1.1-compat --repository=https://dl-cdn.alpinelinux.org/alpine/v3.17/main

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/src/generated/prisma ./dist/generated/prisma

USER node
EXPOSE 3000
CMD ["sh","-lc","npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/server.js"]
