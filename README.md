# Zodiac HR Fit

MVP веб-приложения для HR-проверки кандидата по ФИО, дате рождения и профилю вакансии.

## Что реализовано
- Главная страница `/` с формой проверки и карточкой результата.
- Страница `/roles` для CRUD профилей вакансий.
- API:
  - `POST /api/check` — расчёт зодиака/возраста на сервере + запрос к OpenAI Responses API (strict JSON schema).
  - `GET/POST /api/roles`
  - `PUT/DELETE /api/roles/:id`
  - `POST /api/roles/generate` — AI-генерация профиля вакансии.
- Начальные seed-профили в `data/roles.json`.

## Запуск
1. Установите зависимости:
   ```bash
   npm install
   ```
2. Создайте `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
3. Запустите dev-сервер:
   ```bash
   npm run dev
   ```
4. Откройте `http://localhost:3000`.

## Примечание по хранилищу
В этой сборке используется JSON-хранилище `data/roles.json` (fallback вместо Prisma/SQLite).
