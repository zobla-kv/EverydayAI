// TODO: is this really needed
export interface ProductCategory {
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  information: {
    price: number;
    videoDuration: number;
    downloadSize: number; 
    // duration required to teach dog (3 days etc.)
    daysToMasterSkill: number;
    difficulty: 'easy' | 'medium' | 'hard'
    discount?: {
      percentage: number;
      discountPrice: number;
    }
  }
  imgPath: string;
  //TODO: img alt for SEO
  imgAlt?: string;

  // front end only
  spinners?: any
}