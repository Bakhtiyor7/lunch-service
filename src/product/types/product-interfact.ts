export interface Product {
  id: number;
  name: string;
  price: number;
}

export interface ProductApiResponse {
  statusCode: number;
  data: Product[];
}
