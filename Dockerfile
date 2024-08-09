# Используем образ линукс alpine с верией node 14
FROM node:22-alpine
LABEL authors="mihailden"

# Рабочая директория
WORKDIR /app

# Копирование файлов packsge.json и packsge-lock.json внутрь контейнера
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копируем оставшиеся файлы
COPY . .

# Установить prisma
RUN npm install -g prisma

# Сгенерировать prisma client
RUN prisma generate

# Скопировать prisma schema
COPY prisma/schema.prisma ./prisma/

# Открыть порт в контейнере
EXPOSE 3000

# Запуск сервера
CMD ["npm", "start"]