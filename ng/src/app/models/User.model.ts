import { Timestamp } from '@angular/fire/firestore';

import {
  ProductResponse
} from '@app/models';

export interface RegisterUser {
  id: string;
  name: string,
  email: string,
  password: string
  gender: string
}

// custom user stored in db that is different from firebase user
export interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: string;
  gender: string;
  cart: string[];
  registrationDate: Date;
  lastActiveDate: Date;
  stripe: UserStripeData;
  ownedItems: string[];
  // for firebase query limitations (map id -> ownedSince)
  ownedItemsTimeMap: { [id: string]: Timestamp };
  productLikes: string[];
}

export interface ShoppingCart {
  items: ProductResponse[],
  totalSum: number;
}

interface UserStripeData {
  // null until first buy
  id: string | null;
}

// payment object that is sent to BE
export interface PaymentObject {
  user: {
    id: string;
    email: string;
    shopping_cart_items: string[],
    stripeId: string | null,
    card: PaymentCard;
  }
}

export interface PaymentCard {
  holder_name: string;
  number: string;
  expiration_date: string;
  expiration_date_month: string;
  expiration_date_year: string;
  cvc: string;
}
