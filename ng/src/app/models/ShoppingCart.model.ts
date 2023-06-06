import { 
  Product
} from '@app/models';

//TODO: refactor user to match DB model and make this it's property
export interface ShoppingCart {
  items: Product[],
  // TODO: remove totalSum because it is calculated on BE
  totalSum: number;
}