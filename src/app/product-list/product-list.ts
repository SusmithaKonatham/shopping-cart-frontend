import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product';
import { CartItem } from '../models/cart-item';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})

export class ProductList implements OnInit {

  products: Product[] = [];

  private originalProducts: Product[] = [];

  loading = true;

  errorMessage = '';

  cartMessage = '';

  cartMessageType: string = 'success';

  private messageTimeout?: ReturnType<typeof setTimeout>;

  isAddProductModalOpen = false;

  newProductName = '';

  newProductPrice = '';

  newProductImageFile?: File;

  newProductImagePreview = '';

  addProductError = '';

  isSubmitting = false;

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

        this.errorMessage =
          'Unable to load products — please check the API or network.';

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

        this.showMessage(
          `${product.name} has been added to your cart.`,
          'success'
        );
      },

      error: (err) => {

        console.error('Failed to add to cart', err);

        this.showMessage(
          'Failed to add product to cart.',
          'error'
        );
      }
    });
  }

  inactivateProduct(product: Product): void {

    this.productService.inactivateProduct(product.id).subscribe({

      next: () => {

        this.products =
          this.products.filter(p => p.id !== product.id);

        this.originalProducts =
          this.originalProducts.filter(
            p => p.id !== product.id
          );

        this.showMessage(
          `${product.name} has been marked as inactive.`,
          'info'
        );
      },

      error: (err) => {

        console.error('Failed to inactivate product', err);

        this.showMessage(
          'Failed to inactivate product.',
          'error'
        );
      }
    });
  }

  onSearch(query: string): void {

    const q = (query || '').trim().toLowerCase();

    this.products = q
      ? this.originalProducts.filter(
          p => p.name.toLowerCase().includes(q)
        )
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

        list.sort(
          (a, b) => a.name.localeCompare(b.name)
        );

        break;

      default:

        this.products = [...this.originalProducts];

        return;
    }

    this.products = list;
  }

  trackByProductId(
    index: number,
    product: Product
  ): number {

    return product.id;
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  openAddProductModal(): void {

    this.resetAddProductForm();

    this.isAddProductModalOpen = true;
  }

  closeAddProductModal(): void {
    this.isAddProductModalOpen = false;
  }

  onAddProductImageChange(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {

      this.newProductImageFile = undefined;

      this.newProductImagePreview = '';

      return;
    }

    const file = input.files[0];

    this.newProductImageFile = file;

    this.readImageFile(file)
      .then((url) => {

        this.newProductImagePreview = url;
      })

      .catch((err) => {

        console.error(
          'Failed to load image preview',
          err
        );

        this.newProductImagePreview = '';
      });
  }

  submitAddProduct(): void {

    this.addProductError = '';

    const name = this.newProductName.trim();

    const priceValue =
      Number(this.newProductPrice);

    if (!name) {

      this.addProductError =
        'Product name is required.';

      return;
    }

    if (
      this.originalProducts.some(
        p =>
          p.name.toLowerCase() ===
          name.toLowerCase()
      )
    ) {

      this.addProductError =
        'A product with this name already exists.';

      return;
    }

    if (
      Number.isNaN(priceValue) ||
      priceValue <= 0
    ) {

      this.addProductError =
        'Enter a valid price greater than 0.';

      return;
    }

    // if (!this.newProductImagePreview) {

    //   this.addProductError =
    //     'Please upload a product image.';

    //   return;
    // }

    const payload = {
      name: name,
      price: priceValue,
      imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db',
      // active: true
    };

    this.isSubmitting = true;

    this.productService.addProduct(payload).subscribe({

     next: (created) => {

  this.showMessage(
    `${created.name} added successfully.`,
    'success'
  );

  this.isSubmitting = false;

  this.closeAddProductModal();

  this.loadProducts();
},

      error: (err) => {

        console.error(err);

        this.addProductError =
          'Failed to add product.';

        this.isSubmitting = false;
      }
    });
  }

  private readImageFile(
    file: File
  ): Promise<string> {

    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = () => {

        if (typeof reader.result === 'string') {

          resolve(reader.result);

        } else {

          reject('Invalid image file');
        }
      };

      reader.onerror = () =>
        reject(reader.error);

      reader.readAsDataURL(file);
    });
  }

  private resetAddProductForm(): void {

    this.newProductName = '';

    this.newProductPrice = '';

    this.newProductImageFile = undefined;

    this.newProductImagePreview = '';

    this.addProductError = '';
  }
  toggleProductStatus(product: Product): void {

  const request = product.active
    ? this.productService.inactivateProduct(product.id)
    : this.productService.activateProduct(product.id);

  request.subscribe({
    next: () => {
      product.active = !product.active;
    },
    error: (err) => {
      console.error('Status update failed', err);
    }
  });
}

  private showMessage(
    message: string,
    type: string
  ): void {

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