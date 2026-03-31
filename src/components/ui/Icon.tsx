import React from 'react';
import { cn } from '../../lib/utils';

interface IconProps {
  name: string; // Имя иконки из Google Fonts (например, 'dashboard')
  filled?: boolean; // Делать ли иконку залитой (для активных состояний)
  className?: string;
}

export function Icon({ name, filled = false, className }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-rounded select-none",
        filled ? "[font-variation-settings:'FILL'_1]" : "[font-variation-settings:'FILL'_0]",
        className
      )}
    >
      {name}
    </span>
  );
}
