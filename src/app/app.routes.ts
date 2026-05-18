import { Routes } from '@angular/router';
import { ProductList } from './product-list/product-list';
import { Cart } from './cart/cart';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: ProductList
  },
  {
    path: 'cart',
    component: Cart
  },
  {
    path: '**',
    redirectTo: ''
  }
];