// src/components/Button/Button.tsx
import { type ReactNode } from "react";
// Подключаем ранее упомянутую библиотеку clsx
import clsx from "clsx";

import s from "./Button.module.css";
/**
 * Допустимые значения визуального варианта кнопки.
 * Здесь используется операция объединения(union -
https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
 */
type ButtonVariant = "primary" | "secondary";
/** Допустимые размеры кнопки. */
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
 children: ReactNode;
 variant?: ButtonVariant;
 size?: ButtonSize;
 disabled?: boolean;
 className?: string;
 onClick?: () => void; 
}

export function Button({
 children,
 variant = "primary", // дефолтный вариант
 size = "md", // дефолтный размер
 disabled = false, // по умолчанию кнопка активна

 className,
 onClick,
}: ButtonProps) {
 return (
 <button
 type="button"
 onClick={onClick}
 disabled={disabled}
 className={clsx( // Объединяем набор из нескольких стилей для кнопки
 s.button,
 s[variant], // s.primary или s.secondary
 s[size], // s.sm, s.md или s.lg
 disabled && s.disabled,
 className // внешний пользовательские классы, которые могут быть
 )}
 >
 {children}
 </button>
 );
}
