export interface Product {
  // TODO: make id random so it couldn't be manipulated from FE
  // now entered manually - create endpoint that would add product to DB and do this from postman for now?
  id: number;
  title: string;
  description: string;
  information: {
    price: number;
    videoDuration: number;
    downloadSize: number; 
    // duration required to teach dog (3 days etc.)
    daysToMasterSkill: number;
    // TODO: keep this in some other form (premium etc.)
    difficulty: 'easy' | 'medium' | 'hard'
    discount?: {
      percentage: number;
      discountedPrice: number;
    }
  }
  imgPath: string;
  //TODO: img alt for SEO
  imgAlt?: string;

  // front end only
  spinners?: any
  isInCart?: any;
}