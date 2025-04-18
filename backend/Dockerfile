# Этап 1: сборка TypeScript и генерация Prisma
FROM node:18-alpine AS build

WORKDIR /app

# Установка зависимостей
COPY package*.json ./
RUN npm install

# Копируем исходники и схему
COPY . .
COPY prisma ./prisma

# Генерация Prisma Client
RUN npx prisma generate

# Сборка TypeScript
RUN npm run build

# Этап 2: финальный минимальный образ
FROM node:18-alpine

WORKDIR /app

# Только необходимые файлы
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

# .prisma и @prisma копировать НЕ нужно, они уже внутри node_modules после generate

# Конфигурация
COPY .env .env

EXPOSE 3000

CMD ["node", "dist/src/main"]
