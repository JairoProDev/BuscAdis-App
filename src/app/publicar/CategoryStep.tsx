// CategoryStep.tsx
'use client';

import React from 'react';
import CategorySelector from '@/components/publish/CategorySelector';
import { QuickPublicationData } from '@/services/publications.service';

interface CategoryStepProps {
  ad: QuickPublicationData;
  setAd: React.Dispatch<React.SetStateAction<QuickPublicationData>>;
  onNext: () => void;
}

const CategoryStep: React.FC<CategoryStepProps> = ({ ad, setAd, onNext }) => {
  return (
    <div>
      <CategorySelector
        selectedCategory={ad.category}
        onSelect={(category) => {
          const selectedSubcategory = category.subcategories?.find((sub) => sub.selected);
          setAd({
            ...ad,
            category: {
              ...category,
              subcategories: category.subcategories,
            },
            type: selectedSubcategory ? `${category.id}/${selectedSubcategory.id}` : `${category.id}`,
          });
          setTimeout(onNext, 500);
        }}
      />
    </div>
  );
};

export default CategoryStep;