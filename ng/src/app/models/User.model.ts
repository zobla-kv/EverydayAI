import { Timestamp } from '@angular/fire/firestore';

import {
  Payments,
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
  payments: Payments;
  totalSpent: number;
  ownedItems: string[];
  // for firebase query limitations (map id -> ownedSince)
  ownedItemsTimeMap: { [id: string]: Timestamp };
  productLikes: string[];
}

export interface ShoppingCart {
  items: ProductResponse[],
  totalSum: number;
}
