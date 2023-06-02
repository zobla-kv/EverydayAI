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
// TODO: Important! try implementing auto logout (token into this user)
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