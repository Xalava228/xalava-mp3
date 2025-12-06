# Инструкция по запуску проекта

## Быстрый старт

### 1. Установка зависимостей

```bash
# Из корневой директории проекта
npm run install:all
```

Это установит зависимости для:
- Корневого проекта
- Frontend (React)
- Backend (Express)

### 2. Настройка переменных окружения

**MongoDB больше не нужен!** Данные хранятся в JSON файлах автоматически.

#### Backend

Создайте файл `backend/.env`:

```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Примечание:** MongoDB больше не требуется! Данные автоматически сохраняются в папке `backend/data/` в виде JSON файлов.

#### Frontend

Создайте файл `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Заполнение базы данных

Запустите seed скрипт для создания тестовых данных:

```bash
cd backend
npm run seed
```

Это создаст:
- 5 подкастов
- 25 эпизодов (5 для каждого подкаста)
- 3 трека

### 5. Запуск приложения

#### Вариант A: Из корневой директории

**Терминал 1:**
```bash
npm run dev:backend
```

**Терминал 2:**
```bash
npm run dev:frontend
```

#### Вариант B: Отдельно

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Открытие в браузере

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

## Тестовый аккаунт

После запуска seed скрипта вы можете создать аккаунт через форму регистрации на странице `/login`.

## Хранение данных

Все данные автоматически сохраняются в папке `backend/data/`:
- `users.json` - пользователи
- `podcasts.json` - подкасты  
- `episodes.json` - эпизоды
- `tracks.json` - треки
- `listeningHistory.json` - история прослушиваний

Эти файлы создаются автоматически при первом запуске seed скрипта.

## Возможные проблемы

### CORS ошибки

- Убедитесь, что backend запущен на порту 5000
- Проверьте настройки CORS в `backend/src/index.ts`

### Порт уже занят

- Измените `PORT` в `backend/.env`
- Или измените порт в `frontend/vite.config.ts`

## Структура проекта

```
.
├── frontend/          # React приложение
│   ├── src/
│   │   ├── api/       # API клиенты
│   │   ├── components/# React компоненты
│   │   ├── pages/     # Страницы
│   │   ├── store/     # Zustand stores
│   │   └── types/     # TypeScript типы
│   └── package.json
├── backend/           # Express API
│   ├── src/
│   │   ├── models/    # Mongoose модели
│   │   ├── routes/    # API маршруты
│   │   └── scripts/   # Seed скрипты
│   └── package.json
└── README.md
```

## Дополнительная информация

- См. `frontend/README.md` для деталей о frontend
- См. `backend/README.md` для деталей о backend API


