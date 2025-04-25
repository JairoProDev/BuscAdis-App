// Definición de tipos para el CategorySelector
export interface CategoryItem {
  _id?: string;
  id: string;
  slug: string;
  name: string;
  count?: number;
}

export interface Category extends CategoryItem {
  color?: string;
  icon?: string;
  gradient?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  subcategories?: Subcategory[];
}

export interface Subcategory extends CategoryItem {
  parent?: string;
  icon?: string;
  subsubcategories?: SubSubcategory[];
}

export interface SubSubcategory extends CategoryItem {
  parent?: string;
}

export interface CategorySelectorProps {
  activeCategory?: string;
  activeSubcategory?: string;
  activeSubSubcategory?: string;
  onCategoryChange?: (category: string) => void;
  onSubcategoryChange?: (subcategory: string) => void;
  onSubSubcategoryChange?: (subsubcategory: string) => void;
  showCounts?: boolean;
  variant?: 'horizontal' | 'vertical' | 'grid' | 'tabs';
  showAllOption?: boolean;
  maxVisible?: number;
  className?: string;
  showSubcategories?: boolean;
}

export interface CategoryCardProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
  variant?: 'square' | 'horizontal';
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