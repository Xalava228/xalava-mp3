# Backend API

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Заполните переменные окружения в `.env` (только JWT_SECRET, MongoDB больше не нужен!)

4. Заполните данные:

**Вариант A - Быстрый старт (рекомендуется):**
```bash
npm run seed
```
Создаст 5 подкастов, 50 эпизодов и 20 треков автоматически.

**Вариант B - Импорт из RSS фидов:**
```bash
npm run import
```
Импортирует подкасты из RSS фидов (настройте в `src/scripts/import-podcasts.ts`)

**Вариант C - Оба метода:**
```bash
npm run seed
npm run import
```

5. Запустите сервер:
```bash
npm run dev
```

## Хранение данных

Данные хранятся в JSON файлах в папке `backend/data/`:
- `users.json` - пользователи
- `podcasts.json` - подкасты
- `episodes.json` - эпизоды
- `tracks.json` - треки
- `listeningHistory.json` - история прослушиваний

**Не нужно устанавливать MongoDB!** Всё работает на файлах.

## API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя (требует авторизации)

### Podcasts
- `GET /api/podcasts` - Получить все подкасты
- `GET /api/podcasts/:id` - Получить подкаст по ID
- `GET /api/podcasts/:id/episodes` - Получить эпизоды подкаста

### Episodes
- `GET /api/episodes/:id` - Получить эпизод по ID

### Tracks
- `GET /api/tracks` - Получить все треки
- `GET /api/tracks/:id` - Получить трек по ID

### Search
- `GET /api/search?q=query` - Поиск по трекам, подкастам и эпизодам

### Recommendations
- `GET /api/recommendations` - Получить рекомендации

### Player
- `POST /api/player/progress` - Сохранить прогресс прослушивания (требует авторизации)
- `GET /api/player/history` - Получить историю прослушиваний (требует авторизации)


