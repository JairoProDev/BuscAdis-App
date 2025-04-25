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