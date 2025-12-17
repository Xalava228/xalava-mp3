# ⚡ Быстрое исправление ошибки Railway

## Проблема
Railway не может найти команду запуска, потому что ищет в корне проекта, а `package.json` находится в папке `backend/`.

## Решение (2 минуты)

### В Railway:

1. Откройте ваш сервис
2. Перейдите в **Settings** (вкладка сверху)
3. Найдите секцию **"Root Directory"**
4. Введите:
   ```
   backend
   ```
5. Найдите секцию **"Start Command"**
6. Введите:
   ```
   npm start
   ```
7. Найдите секцию **"Build Command"** (если есть)
8. Введите:
   ```
   npm install && npm run build
   ```

### Переменные окружения:

Перейдите в **Variables** и добавьте:
```
NODE_ENV=production
JWT_SECRET=<ваш-ключ>
FRONTEND_URL=https://your-frontend.railway.app
BASE_URL=https://your-backend.railway.app
```

### После настройки:

Railway автоматически перезапустит деплой. Подождите 1-2 минуты и проверьте статус.

## Если всё ещё не работает:

1. Удалите сервис в Railway
2. Создайте новый через "New Service" → "GitHub Repo"
3. Сразу в настройках укажите Root Directory: `backend`
4. Добавьте переменные окружения
5. Railway соберёт и запустит проект

---

**Главное:** Root Directory должен быть `backend` - это самое важное!

