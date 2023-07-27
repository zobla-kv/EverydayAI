import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ReplaySubject, Subscription, first } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { CustomUser } from '../models/User.model';

// service for persisting product like for unauthorized user
// NOTE: alive as long as module is alive, if more modules are introduced this might get destroyed
@Injectable({
  providedIn: 'root'
})

export class ProductLikeService {

  // products liked by current user (not number of likes on single product)
  private _likes: string[];

  likes$ = new ReplaySubject<string[]>;

  userStateSub$: Subscription;

  getLikes() {
    return this._likes;
  }

  addLike(productId: string, user: CustomUser | null) {
    this._likes.push(productId);
    this.likes$.next(this._likes);

    this._firebaseService.addProductLike(productId, user);
  }

  constructor(
    private _authService: AuthService,
    private _firebaseService: FirebaseService
  ) { 
    this._authService.userState$.pipe(first()).subscribe(user => {
      if (!user) {
        this._likes = [];
      } else {
        this._likes = user.productLikes;
      }
      this.likes$.next(this._likes);
    })
  }
}
