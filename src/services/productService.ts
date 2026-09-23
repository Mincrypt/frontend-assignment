import apiClient from '@/lib/api';
import { Category, Product, ProductListResponse, ProductQueryParams } from '@/types/product';

/**
 * Service for handling Product CRUD, Search, Categories, and Pagination.
 */
export const productService = {
  /**
   * Fetch paginated products with optional sorting and limit/skip.
   * DummyJSON Endpoint: GET /products
   */
  async getProducts(params: ProductQueryParams = {}, signal?: AbortSignal): Promise<ProductListResponse> {
    const { limit = 10, skip = 0, sortBy, order, delay } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('skip', String(skip));

    if (sortBy) searchParams.set('sortBy', sortBy);
    if (order) searchParams.set('order', order);
    if (delay) searchParams.set('delay', String(delay));

    const response = await apiClient.get<ProductListResponse>(`/products?${searchParams.toString()}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Search products by query term with optional delay and sorting.
   * DummyJSON Endpoint: GET /products/search?q={query}
   */
  async searchProducts(query: string, params: ProductQueryParams = {}, signal?: AbortSignal): Promise<ProductListResponse> {
    const { limit = 10, skip = 0, sortBy, order, delay } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('q', query);
    searchParams.set('limit', String(limit));
    searchParams.set('skip', String(skip));

    if (sortBy) searchParams.set('sortBy', sortBy);
    if (order) searchParams.set('order', order);
    if (delay) searchParams.set('delay', String(delay));

    const response = await apiClient.get<ProductListResponse>(`/products/search?${searchParams.toString()}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Fetch list of all product categories.
   * DummyJSON Endpoint: GET /products/categories
   */
  async getCategories(signal?: AbortSignal): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/products/categories', {
      signal,
    });
    return response.data;
  },

  /**
   * Fetch products filtered by category with pagination.
   * DummyJSON Endpoint: GET /products/category/{category}
   */
  async getProductsByCategory(
    category: string,
    params: ProductQueryParams = {},
    signal?: AbortSignal
  ): Promise<ProductListResponse> {
    const { limit = 10, skip = 0, sortBy, order, delay } = params;
    const searchParams = new URLSearchParams();
    searchParams.set('limit', String(limit));
    searchParams.set('skip', String(skip));

    if (sortBy) searchParams.set('sortBy', sortBy);
    if (order) searchParams.set('order', order);
    if (delay) searchParams.set('delay', String(delay));

    const encodedCategory = encodeURIComponent(category);
    const response = await apiClient.get<ProductListResponse>(
      `/products/category/${encodedCategory}?${searchParams.toString()}`,
      { signal }
    );
    return response.data;
  },

  /**
   * Fetch single product details by ID.
   * DummyJSON Endpoint: GET /products/{id}
   */
  async getProduct(id: string | number, signal?: AbortSignal): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`, {
      signal,
    });
    return response.data;
  },

  /**
   * Add a new product (simulated on DummyJSON).
   * DummyJSON Endpoint: POST /products/add
   */
  async createProduct(productData: Partial<Product>): Promise<Product> {
    const response = await apiClient.post<Product>('/products/add', productData);
    return response.data;
  },

  /**
   * Update an existing product (simulated on DummyJSON).
   * DummyJSON Endpoint: PUT /products/{id}
   */
  async updateProduct(id: string | number, productData: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, productData);
    return response.data;
  },

  /**
   * Delete product by ID (simulated on DummyJSON).
   * DummyJSON Endpoint: DELETE /products/{id}
   */
  async deleteProduct(id: string | number): Promise<Product & { isDeleted?: boolean; deletedOn?: string }> {
    const response = await apiClient.delete<Product & { isDeleted?: boolean; deletedOn?: string }>(
      `/products/${id}`
    );
    return response.data;
  },
};

export default productService;
