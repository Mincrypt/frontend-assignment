export interface ProductReview {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface ProductDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface ProductMeta {
  createdAt?: string;
  updatedAt?: string;
  barcode?: string;
  qrCode?: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  meta?: ProductMeta;
  images: string[];
  thumbnail: string;
  // Local state marker
  isLocalAdded?: boolean;
  isLocalEdited?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface CategoryItem {
  slug: string;
  name: string;
  url: string;
}

export type Category = string | CategoryItem;

export interface ProductQueryParams {
  limit?: number;
  skip?: number;
  select?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  q?: string;
  delay?: number;
}

export type SortField = 'price' | 'rating' | 'title' | '';
export type SortOrder = 'asc' | 'desc';

export interface ProductFormValues {
  title: string;
  description: string;
  price: number | string;
  discountPercentage?: number | string;
  stock: number | string;
  brand: string;
  category: string;
  rating?: number | string;
  sku?: string;
  warrantyInformation?: string;
  shippingInformation?: string;
  thumbnail?: string;
  images?: string[];
}
