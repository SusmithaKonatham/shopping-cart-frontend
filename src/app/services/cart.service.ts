import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { CartItem } from '../models/cart-item';
import { API_BASE_URL } from '../config';

interface CartApiResponse {
  success: boolean;
  message: string;
  data: CartItem[];
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly apiUrl: string;
  private readonly cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  readonly cartItems$ = this.cartItemsSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) private baseUrl: string
  ) {
    this.apiUrl = `${this.baseUrl}/cart`;
  }

  loadCartItems(): Observable<CartItem[]> {
    return this.http.get<CartApiResponse>(this.apiUrl).pipe(
      map((response) => response.data ?? []),
      tap((items) => this.cartItemsSubject.next(items))
    );
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItems$;
  }

  addToCart(item: Omit<CartItem, 'id'>): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiUrl, item).pipe(
      tap((addedItem) => {
        this.cartItemsSubject.next([
          ...this.cartItemsSubject.value,
          addedItem
        ]);
      })
    );
  }

  removeFromCart(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cartItemsSubject.next(
          this.cartItemsSubject.value.filter((item) => item.id !== id)
        );
      })
    );
  }
}