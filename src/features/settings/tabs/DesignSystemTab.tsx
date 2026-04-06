import React from 'react';
import { TypographyBlock } from '../../design-system/blocks/TypographyBlock';
import { ColorsBlock } from '../../design-system/blocks/ColorsBlock';
import { PremiumEffectsBlock } from '../../design-system/blocks/PremiumEffectsBlock';
import { ButtonsBlock } from '../../design-system/blocks/ButtonsBlock';
import { InputsBlock } from '../../design-system/blocks/InputsBlock';

export function DesignSystemTab() {
  return (
    <div className="p-6 flex flex-col gap-8">
      <div className="border-b border-border/50 pb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Главный системный UI Kit</h2>
        <p className="text-secondary leading-relaxed max-w-3xl">
          Здесь собраны все атомарные компоненты. При разработке новых фич использовать СТРОГО стили и переменные из этого раздела.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-12">
        <TypographyBlock />
        <ColorsBlock />
        <PremiumEffectsBlock />
        <ButtonsBlock />
        <InputsBlock />
      </div>
    </div>
  );
}
