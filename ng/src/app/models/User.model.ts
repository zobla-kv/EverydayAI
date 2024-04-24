import { Timestamp } from '@angular/fire/firestore';

import {
  Payments,
  ProductResponse
} from '@app/models';

export interface RegisterUser {
  id: string;
  name: string;
  email: string;
  password: string;
  dob: Date;
  gender: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

// custom user stored in db that is different from firebase user
export interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: string;
  dob: string;
  gender: string;
  cart: string[];
  registrationDate: string;
  lastActiveDate: string;
  payments: Payments[];
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
