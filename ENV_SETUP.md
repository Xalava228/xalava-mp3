# Настройка переменных окружения

## Backend (.env в папке backend/)

Создайте файл `backend/.env` со следующим содержимым:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (для CORS)
FRONTEND_URL=https://yourdomain.com

# Base URL для генерации ссылок на файлы
# ВАЖНО: Используйте реальный домен вашего сервера
BASE_URL=https://yourdomain.com

# JWT Secret (ОБЯЗАТЕЛЬНО измените на случайную строку!)
# Генерируйте через: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Database (JSON files location)
DATA_DIR=backend/data

# Uploads directory
UPLOADS_DIR=backend/uploads
```

## Frontend (.env в папке frontend/)

Создайте файл `frontend/.env` со следующим содержимым:

```env
# API URL
# В продакшене должен быть реальный URL бэкенда
VITE_API_URL=https://yourdomain.com/api
```

## Генерация JWT_SECRET

Для генерации безопасного JWT_SECRET выполните:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Скопируйте результат в `JWT_SECRET` в `backend/.env`.

