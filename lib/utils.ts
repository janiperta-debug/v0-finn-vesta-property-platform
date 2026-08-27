import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEur(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)} M\u20AC`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)} k\u20AC`
  }
  return `${value} \u20AC`
}
