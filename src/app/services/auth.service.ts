import { Injectable } from '@angular/core';

import { 
  User, 
  FirebaseResponse 
} from '@app/models';

import { FirebaseService } from '@app/services';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private FirebaseService: FirebaseService
  ) { }

  // register new user
  register(user: User): Promise<FirebaseResponse> {
    return this.FirebaseService.register(user);
  }
}
