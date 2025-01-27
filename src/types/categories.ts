export interface CategoryOption {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  subcategories?: CategoryOption[];
  subcategory?: CategoryOption;  // Selected subcategory
}

export interface CategorySelectorProps {
  selectedCategory?: CategoryOption | null;
  onSelect: (category: CategoryOption) => void;
} 