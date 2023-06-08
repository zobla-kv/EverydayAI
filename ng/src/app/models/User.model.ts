// TODO: remove User class because it is unused
import { 
  ShoppingCart
} from '@app/models';

export class User {
  constructor(
    public id: string,
    private _token: string,
    private _tokenExpirationDate: Date
  ) {}

  get token() {
    if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
      return null;
    }
    return this._token;
  }
}

export interface RegisterUser {
  id: string;
  name: string,
  email: string,
  password: string
  gender: string
}

// custom user stored in db that is different from frebase user
// TODO: auto logout?
// TODO: eliminate password from here
export class CustomUser {
  id: string;
  email: string;
  name: string;
  gender: string;
  cart: ShoppingCart;
  // used for registration and login
  // TODO: exposed
  password?: string;
  registrationDate: Date;
  lastActiveDate: Date;
  stripe?: UserStripeData;
}

interface UserStripeData {
  id: string;
}

// payment object that is sent to BE 
export interface PaymentObject {
  user: {
    id: string;
    email: string;
    // TODO: !important update to string once product id is a string in db
    shopping_cart_items: { id: number, title: string }[],
    stripeId: string | undefined,
    card: PaymentCard;
  },
}

export interface PaymentCard {
  holder_name: string;
  number: string;
  expiration_date: string;
  expiration_date_month: string;
  expiration_date_year: string;
  cvc: string;
}