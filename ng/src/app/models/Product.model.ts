// TODO: is this really needed
export interface ProductCategory {
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  imgPath: string;
  //TODO: img alt for SEO
  imgAlt?: string;
  // size in mb
  size?: string; 
}