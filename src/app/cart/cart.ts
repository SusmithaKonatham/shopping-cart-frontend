import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { map } from 'rxjs';

import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item';

type MessageType = 'success' | 'info' | 'error';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class Cart implements OnInit {

  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly cartItems$ = this.cartService.cartItems$;
  readonly total$ = this.cartItems$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.price, 0))
  );

  message = '';
  messageType: MessageType = 'success';
  private messageTimeout?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.loadCartItems().subscribe({
      next: () => {},
      error: (err) => {
        console.error('Failed to load cart items', err);
        this.showMessage('Failed to load cart items.', 'error');
      }
    });
  }

  deleteFromCart(id: number, productName: string): void {
    this.cartService.removeFromCart(id).subscribe({
      next: () => {
        this.showMessage(`${productName} removed from cart.`, 'success');
      },
      error: (err) => {
        console.error('Failed to remove item from cart', err);
        this.showMessage('Failed to remove item from cart.', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  checkout(): void {
    this.showMessage('Proceeding to checkout...', 'success');
    console.log('Checkout requested');
  }

  continueShopping(): void {
    this.goBack();
  }

  trackByCartItemId(index: number, item: CartItem): number {
    return item.id;
  }

  private showMessage(message: string, type: MessageType): void {
    this.messageType = type;
    this.message = message;
    if (this.messageTimeout) {
      clearTimeout(this.messageTimeout);
    }
    this.messageTimeout = window.setTimeout(() => {
      this.message = '';
    }, 4000);
  }
}
