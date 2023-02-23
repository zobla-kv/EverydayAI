// TODO: distinguish between Firebase user (User from 2 lines below, not class name) 
// and Custom user stored in firestore db (RegisterUser)
// import { User as FirebaseUser } from '@angular/fire/auth
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