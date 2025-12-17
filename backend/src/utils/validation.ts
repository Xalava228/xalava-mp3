// Валидация данных для безопасности

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

export const validatePassword = (password: string): boolean => {
  // Минимум 6 символов, максимум 128
  return password.length >= 6 && password.length <= 128
}

export const validateName = (name: string): boolean => {
  // Минимум 2 символа, максимум 100, только буквы, цифры, пробелы и некоторые спецсимволы
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s\-_]{2,100}$/
  return nameRegex.test(name)
}

export const sanitizeString = (str: string, maxLength: number = 1000): string => {
  // Удаляем потенциально опасные символы и ограничиваем длину
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .substring(0, maxLength)
    .trim()
}

export const validateTitle = (title: string): boolean => {
  const sanitized = sanitizeString(title, 200)
  return sanitized.length >= 1 && sanitized.length <= 200
}

export const validateDescription = (description: string): boolean => {
  const sanitized = sanitizeString(description, 2000)
  return sanitized.length <= 2000
}

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

