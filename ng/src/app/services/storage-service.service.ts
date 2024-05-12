import { Injectable } from '@angular/core';

// storage keys
export enum StorageKey {
  STORED_ROUTE = 'stored_route',
  GOOGLE_AUTH = 'g_a',
  GENERATED_IMAGE_DATA = 'gen_img_data'
}

/**
 * Service for interacting with browser storage.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  // storage keys
  public storageKey: typeof StorageKey = StorageKey;

  // store value to local storage
  storeToLocalStorage(key: StorageKey, value: string) {
    localStorage.setItem(key, value);
  }

  // get value from local storage
  getFromLocalStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  // delete value from local storage
  deleteFromLocalStorage(key: string): void {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  }

  // store value to session storage
  storeToSessionStorage(key: StorageKey, value: string) {
    sessionStorage.setItem(key, value);
  }

  // get value from session storage
  getFromSessionStorage(key: StorageKey): string | null {
    return sessionStorage.getItem(key);
  }

  // delete value from session storage
  deleteFromSessionStorage(key: StorageKey): void {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
    }
  }

}
