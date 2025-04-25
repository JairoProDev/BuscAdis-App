// Definición de tipos para el CategorySelector
import { ElementType } from 'react';

export type CategoryCardVariant = 'square' | 'horizontal';

export interface CategoryItem {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
  icon: ElementType;
  parentId: string;
  subSubcategories: SubSubcategory[];
}

export interface SubSubcategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
  emoji: string;
  parentId: string;
}

export interface CategorySelectorProps {
  onSelectCategory?: (category: Category | null) => void;
  onSelectSubcategory?: (subcategory: Subcategory | null) => void;
  onSelectSubSubcategory?: (subSubcategory: SubSubcategory | null) => void;
  variant?: CategoryCardVariant;
  className?: string;
  showCounts?: boolean;
  initialCategorySlug?: string;
  initialSubcategorySlug?: string;
  initialSubSubcategorySlug?: string;
}

export interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  variant?: 'square' | 'horizontal';
  showImage?: boolean;
}

export interface SubcategoryListProps {
  subcategories: Subcategory[];
  activeSubcategory?: string;
  onSubcategoryClick: (subcategorySlug: string) => void;
}

export interface SubSubcategoryListProps {
  subsubcategories: SubSubcategory[];
  activeSubSubcategory?: string;
  onSubSubcategoryClick: (subsubcategory: SubSubcategory) => void;
} 