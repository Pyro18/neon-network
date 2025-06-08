import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Funzione di utilità per combinare classi CSS condizionali
 * 
 * Utilizza clsx per gestire classi condizionali e twMerge per risolvere
 * conflitti tra classi Tailwind CSS, garantendo che le classi più specifiche
 * abbiano precedenza su quelle generiche
 * 
 * @param inputs - Array di classi CSS o condizioni
 * @returns Stringa di classi CSS ottimizzata
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
