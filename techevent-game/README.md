# Координационный Щит — мини-игра для TechEventPro

Премиальная мини-игра в стиле neo-tech / glass / neon для лендинга TechEventPro.

## Стек
- React + Vite + TypeScript
- TailwindCSS
- Framer Motion
- dnd-kit
- lucide-react

## Запуск локально
```bash
npm i
npm run dev
```

## Сборка
```bash
npm run build
npm run preview
```

## Что реализовано
- Таймер 60 секунд (настраивается в `src/game/engine.ts`)
- 30 случайных карточек из набора 36
- Drag & Drop + tap-режим для мобильных
- Очки, хаос/стабильность, комбо
- Финальная оценка A/B/C
- Промежуточный лид-экран с мини-формой
- CTA в Telegram и email с подстановкой результата и данных формы
- Локальное сохранение результата в `localStorage`
- Аналитические хуки: `window.techeventTrack(eventName, payload)`

## Встраивание в лендинг

### 1) Отдельная страница `/game`
1. Соберите проект: `npm run build`.
2. Загрузите содержимое `dist/` на ваш хостинг как отдельный маршрут `https://techevent.pro/game`.
3. Для SPA-маршрутизации оставьте fallback на `index.html`.

### 2) Встраивание как виджет

#### Вариант iframe
```html
<section id="game">
  <iframe
    src="https://techevent.pro/game"
    title="Координационный Щит"
    style="width:100%;min-height:860px;border:0;border-radius:20px;"
    loading="lazy"
  ></iframe>
</section>
```

#### Вариант bundle-вставки
1. Вставьте собранные `assets/*.js` и `assets/*.css` в ваш шаблон.
2. Добавьте контейнер `<div id="techevent-game-root"></div>`.
3. Инициализируйте React-приложение в этом контейнере (можно адаптировать `src/main.tsx`).

## Быстрая кастомизация
- Цвета/эффекты: `tailwind.config.js`, `src/styles.css`
- Тексты интерфейса: `src/App.tsx`, `src/game/ui/*`
- Длительность и баланс: `src/game/engine.ts`
- Набор рисков и зоны: `src/game/data.ts`
- Контакты: `TELEGRAM_USERNAME`, `EMAIL` в `src/App.tsx`
