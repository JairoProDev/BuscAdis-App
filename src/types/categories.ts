export interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  subcategories?: CategoryOption[];
  selected?: boolean;
}

export interface CategorySelectorProps {
  selectedCategory?: CategoryOption | null;
  onSelect: (category: CategoryOption) => void;
} 
