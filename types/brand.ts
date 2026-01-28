export interface BrandModel {
  id: string;
  name?: string;
  origin?: string;
  description?: string;
  images?: string[];
  parentId?: string | null; // Parent brand ID for sub-brand hierarchy
}

// Helper type for building brand tree
export interface BrandTreeNode extends BrandModel {
  children: BrandTreeNode[];
}
