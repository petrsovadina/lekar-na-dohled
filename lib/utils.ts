import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility pro formátování českých dat
export function formatCzechDate(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Utility pro formátování českého času
export function formatCzechTime(date: Date): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Utility pro formátování českého telefonu
export function formatCzechPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('420')) {
    const number = cleaned.substring(3)
    return `+420 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
  }
  return phone
}

// Utility pro validaci českého poštovního směrovacího čísla
export function isValidCzechPostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode)
}

// Utility pro validace rodného čísla
export function isValidBirthNumber(birthNumber: string): boolean {
  return /^\d{6}\/\d{4}$/.test(birthNumber)
}

// Utility pro generování bezpečného ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Utility pro debouncing
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Utility pro truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Utility pro sleep
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}