export class User {
  constructor(
    id: string,
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