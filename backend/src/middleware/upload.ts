import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Создаём папки для загрузок если их нет
const uploadsDir: string = path.join(process.cwd(), 'backend', 'uploads')
const audioDir: string = path.join(uploadsDir, 'audio')
const coversDir: string = path.join(uploadsDir, 'covers')

// Создаём папки если их нет
const dirs: string[] = [uploadsDir, audioDir, coversDir]
dirs.forEach((dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Настройка для аудио файлов
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname))
  }
})

// Настройка для обложек
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coversDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname) || '.jpg'
    cb(null, 'cover-' + uniqueSuffix + ext)
  }
})

// Фильтры файлов
const audioFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Разрешены только аудио файлы (mp3, wav, ogg, m4a)'))
  }
}

const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Разрешены только изображения (jpg, png, webp)'))
  }
}

export const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
})

export const uploadCover = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
})

