import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product';
import { CartItem } from '../models/cart-item';

type MessageType = 'success' | 'info' | 'error';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit {

  products: Product[] = [];
  private originalProducts: Product[] = [];
  loading = true;
  errorMessage = '';
  cartMessage = '';
  cartMessageType: MessageType = 'success';
  private messageTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (list) => {
        this.products = list;
        this.originalProducts = [...list];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load products', err);
        this.errorMessage = 'Unable to load products — please check the API or network.';
        this.loading = false;
      }
    });
  }

  addToCart(product: Product): void {
    const payload: Omit<CartItem, 'id'> = {
      productName: product.name,
      price: product.price
    };

    this.cartService.addToCart(payload).subscribe({
      next: () => {
        this.showMessage(`${product.name} has been added to your cart.`, 'success');
      },
      error: (err) => {
        console.error('Failed to add to cart', err);
        this.showMessage('Failed to add product to cart.', 'error');
      }
    });
  }

  inactivateProduct(product: Product): void {
    this.productService.inactivateProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== product.id);
        this.originalProducts = this.originalProducts.filter(p => p.id !== product.id);
        this.showMessage(`${product.name} has been marked as inactive.`, 'info');
      },
      error: (err) => {
        console.error('Failed to inactivate product', err);
        this.showMessage('Failed to inactivate product.', 'error');
      }
    });
  }

  onSearch(query: string): void {
    const q = (query || '').trim().toLowerCase();
    this.products = q
      ? this.originalProducts.filter(p => p.name.toLowerCase().includes(q))
      : [...this.originalProducts];
  }

  onSort(mode: string): void {
    const list = [...this.products];
    switch (mode) {
      case 'priceAsc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'nameAsc':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        list.splice(0, list.length, ...this.originalProducts);
    }
    this.products = list;
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  private showMessage(message: string, type: MessageType): void {
    this.cartMessageType = type;
    this.cartMessage = message;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = window.setTimeout(() => {
      this.cartMessage = '';
    }, 4000);
  }
}
