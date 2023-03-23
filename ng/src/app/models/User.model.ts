// TODO: distinguish between Firebase user (User from 2 lines below, not class name) 
// and Custom user stored in firestore db (RegisterUser)
// import { User as FirebaseUser } from '@angular/fire/auth
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
// TODO: try implementing auto logout (token into this user)
// TODO: eliminate password from here
export class CustomUser {
  id: string;
  email: string;
  name: string;
  gender: string;
  cart: ShoppingCart;
  // used for registration and login
  password?: string;
}