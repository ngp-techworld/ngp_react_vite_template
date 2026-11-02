import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Joins class names and lets later Tailwind classes override earlier ones (`px-2` + `px-4` = `px-4`). */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
