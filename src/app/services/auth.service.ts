import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
    private router: Router,
    private FirebaseService: FirebaseService
  ) { }

  // register new user
  register(user: User): Promise<FirebaseResponse> {
    return this.FirebaseService.register(user);
  }
}
