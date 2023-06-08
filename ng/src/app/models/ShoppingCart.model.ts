import { 
  Product
} from '@app/models';

//TODO: refactor user to match DB model and make this it's property
export interface ShoppingCart {
  items: Product[],
  totalSum: number;
}