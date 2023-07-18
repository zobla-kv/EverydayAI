// TODO: remove User class because it is unused
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
  gender: string;
  cart: ShoppingCart;
  registrationDate: Date;
  lastActiveDate: Date;
  stripe: UserStripeData;
  // ids of owner items TODO: change to string once id is updated in db
  ownedItems: number[];
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
    // TODO: !important update to string once product id is a string in db
    shopping_cart_items: { id: number, title: string }[],
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