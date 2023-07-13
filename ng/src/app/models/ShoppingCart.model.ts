import { ProductResponse } from "./Product.model";

//TODO: refactor user to match DB model and make this it's property
export interface ShoppingCart {
  items: ProductResponse[],
  totalSum: number;
}