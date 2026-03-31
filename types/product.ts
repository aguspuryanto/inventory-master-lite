export interface ProductCategory {
  id: string; // UUID
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  id_product: string;  // UUID type but kept as string in TypeScript
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  category: string;
  categoryId?: string;
  image_url?: string;
  hasVariants?: boolean;
  createdAt: string;
  updatedAt: string;
}
