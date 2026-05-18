import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Product } from '../models/product';
import { API_BASE_URL } from '../config';

export interface ProductsApiResponse {
  success: boolean;
  message: string;
  data: Product[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {
    this.apiUrl = `${this.baseUrl}/products`;
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<ProductsApiResponse>(this.apiUrl).pipe(
      map((response) => response.data ?? [])
    );
  }

  addProduct(product: Omit<Product, 'id' | 'active'>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  inactivateProduct(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, {});
  }
}