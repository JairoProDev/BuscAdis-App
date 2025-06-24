export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
  image?: string;
  icon?: React.ElementType;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
  icon?: React.ElementType;
  parentId: string;
  subSubcategories?: SubSubcategory[];
}

export interface SubSubcategory {
  id: string;
  name: string;
  slug: string;
  count?: number;
  emoji?: string;
  parentId: string;
}

export interface CategorySelectorProps {
  activeCategory?: string;
  activeSubcategory?: string;
  activeSubSubcategory?: string;
  onCategoryChange?: (category: string) => void;
  onSubcategoryChange?: (subcategory: string) => void;
  onSubSubcategoryChange?: (subSubcategory: string) => void;
  showAllOption?: boolean;
  className?: string;
  showSubcategories?: boolean;
  showCounts?: boolean;
  variant?: "inline" | "dropdown" | "modal";
}