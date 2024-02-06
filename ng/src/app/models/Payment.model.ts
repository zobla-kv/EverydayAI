import { Timestamp } from "@angular/fire/firestore";

export interface Payments {
  orderId: string;
  items: string[];
  amount: number;
  date: Timestamp;
}[];

export interface createOrderApiResponse {
  orderId: string;
}

export interface captureOrderApiResponse {
  message: 'succeeded' | 'failed';
}
