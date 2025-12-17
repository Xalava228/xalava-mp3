# Быстрый старт - пошаговая инструкция

## Шаг 1: Установка зависимостей

Откройте терминал в корневой папке проекта и выполните:

```bash
npm run install:all
```

Это установит все необходимые библиотеки для frontend и backend.

---

## Шаг 2: Создание файла настроек backend

### Что это такое?
Файл `.env` нужен для хранения секретных настроек (например, ключ для шифрования паролей).

### Что делать:

1. Откройте папку `backend` в проекте
2. Найдите файл `.env.example` (если его нет, создайте новый файл с именем `.env`)
3. Скопируйте содержимое из `.env.example` в новый файл `.env`

**Или через терминал:**

```bash
cd backend
copy .env.example .env
```

(На Linux/Mac используйте: `cp .env.example .env`)

4. Откройте файл `.env` в любом текстовом редакторе (Блокнот, VS Code и т.д.)

5. Вы увидите что-то вроде:
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

6. **Замените** `your-super-secret-jwt-key-change-this-in-production` на любую случайную строку, например:
```
JWT_SECRET=мой-секретный-ключ-12345-abcdef
```

**Важно:** Это просто строка для безопасности. Можете написать что угодно, главное чтобы это была не пустая строка.

**Готовый пример `.env` файла:**
```
PORT=5000
JWT_SECRET=secret-key-12345
NODE_ENV=development
```

---

## Шаг 3: Заполнение тестовыми данными

### Что это такое?
Скрипт `seed` создаст тестовые данные: подкасты, эпизоды и треки, чтобы вы могли сразу протестировать приложение.

### Что делать:

1. Убедитесь, что вы в папке `backend`:
```bash
cd backend
```

2. Запустите команду:
```bash
npm run seed
```

3. Вы увидите сообщения типа:
```
Starting seed...
Created 5 podcasts
Created 25 episodes
Created 3 tracks
Seed completed successfully!
Data files created in: .../backend/data
```

4. После этого в папке `backend` появится новая папка `data` с JSON файлами:
   - `users.json` (пока пустой, пользователи создаются при регистрации)
   - `podcasts.json` (5 подкастов)
   - `episodes.json` (25 эпизодов)
   - `tracks.json` (3 трека)

**Готово!** Теперь у вас есть тестовые данные.

---

## Шаг 4: Запуск проекта

### Запуск backend (Терминал 1):

```bash
cd backend
npm run dev
```

Вы увидите:
```
Server running on port 5000
Data stored in: .../backend/data
```

### Запуск frontend (Терминал 2):

Откройте **новый** терминал:

```bash
cd frontend
npm run dev
```

Вы увидите:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

---

## Шаг 5: Открытие в браузере

Откройте браузер и перейдите по адресу:
```
http://localhost:3000
```

---

## Если что-то пошло не так

### Ошибка "Cannot find module"
```bash
# Убедитесь, что установили зависимости
npm run install:all
```

### Ошибка при запуске seed
```bash
# Убедитесь, что вы в папке backend
cd backend
npm run seed
```

### Backend не запускается
- Проверьте, что файл `backend/.env` существует
- Проверьте, что в `.env` указан `JWT_SECRET`

### Frontend не подключается к backend
- Убедитесь, что backend запущен на порту 5000
- Проверьте файл `frontend/.env` - там должен быть `VITE_API_URL=http://localhost:5000/api`

