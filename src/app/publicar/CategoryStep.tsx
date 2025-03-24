'use client';

import React from 'react';
import CategorySelector from '@/components/publish/CategorySelector';
import { QuickPublicationData } from '@/services/publications.service';

interface CategoryStepProps {
    ad: QuickPublicationData;
    setAd: React.Dispatch<React.SetStateAction<QuickPublicationData>>;
    onNext: () => void;
}

const CategoryStep: React.FC<CategoryStepProps> = () => {
    return (
        <div>
            <CategorySelector />
        </div>
    );
};

export default CategoryStep;