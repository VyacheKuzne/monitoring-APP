**Зависимости**

Для работы системы необходимо установить:

- Node: <a>https://nodejs.org</a>

---

**Установка и настройка**

Выполнить команды в терминале, предварительно выбрав нужную папку:

- Клонировать репозиторий `git clone <link>` (вписать `git pull` если требуется обновить до новой версии)
- Отдельно для папок `frontend` и `backend`, прописать в терминале команду `npm install`
<!-- - Находясь в папке `backend`, также прописать `npm install prisma --save-dev` + `npm install @prisma/client` -->

---

**Запуск**

Порядок запуска:

1. Мигрировать БД `npx prisma migrate deploy` (`npx prisma migrate reset` для обновления)
2. Для папки `frontend`, прописать `npm start`
3. Для папки `backend`, прописать `npm run start`