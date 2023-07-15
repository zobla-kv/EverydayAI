
import { CustomUser } from "./User.model";

export interface ProductResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number;
  imgPath: string;
  imgAlt: string;
  metadata: ProductTypePrintMetadata | ProductTypeShirtMetadata;
}

export interface ProductTypePrint extends ProductResponse {
  metadata: ProductTypePrintMetadata
}

export interface ProductShirtPrint extends ProductResponse {
  metadata: ProductTypeShirtMetadata
}

interface ProductTypePrintMetadata {
  [key: string]: {
    downloadSize: number; 
    resolution: string;
    extension: string;
    tier: 'classic' | 'premium';
  }
}

interface ProductTypeShirtMetadata {
  [key: string]: {
    size: 'SM' | 'XL' | 'XXL';
    color: string;
  }
}

// all actions for all products
enum ProductActions {
  CART = 'cart',
  DOWNLOAD = 'download',
  LIKE = 'like'
}

export namespace ProductType {
  export enum PRINTS {
    SHOP = 'prints_shop',
    OWNED_ITEMS = 'prints_owned_items'
  }
}

export class ProductListConfig {

  title: string;
  product: { type: any, actions: ProductActions[], metadata: string[] }
  pageSize: number;

  // images to download
  public static PRODUCT_LIST_PRINTS = {
    TAB_SHOP: {
      id: 0,
      title: 'Explore new products',
      product: {
        type: ProductType.PRINTS.SHOP,
        actions: [ProductActions.CART, ProductActions.LIKE],
        metadata: ['price', 'tier', 'extension', 'downloadSize', 'resolution']
      },
      pageSize: 6
    },
    TAB_OWNED_ITEMS: {
      id: 1,
      title: 'Download your items',
      product: {
        type: ProductType.PRINTS.OWNED_ITEMS,
        actions: [ProductActions.DOWNLOAD],
        metadata: ['resolution', 'tier', 'extension']
      },
      pageSize: 6
    }
  }

}

// modify Product from BE to include FE properties
export class ProductMapper<T extends ProductResponse> implements ProductResponse {
  id: number;
  title: string;
  description: string;
  price: number;
  discount: number;
  imgPath: string;
  imgAlt: string;
  metadata: ProductTypePrintMetadata | ProductTypeShirtMetadata;
  // FE properties that are added
  spinners: any;
  isInCart: boolean;
  metadataIconMap: MetadataIconMap;

  constructor(product: T, config: ProductListConfig, user: CustomUser | null) {
    this.id = product.id;
    this.title = product.title;
    this.description = product.description;
    this.price = product.price;
    this.discount = product.discount;
    this.imgPath = product.imgPath;
    this.imgAlt = product.imgAlt;
    this.metadata = product.metadata;
    // spinner for each action
    this.spinners = Object.assign({}, ...config.product.actions.map(action => ({ [action]: false })));
    this.isInCart = !config.product.actions.includes(ProductActions.CART) ? false : 
      user?.cart.items.findIndex(item => item.id === product.id) === 1 ? 
      true : false;
    this.metadataIconMap = ProductMapper._getMetadataMap(config.product.metadata, product.metadata);
  }

  // get original object to store in db
  static getOriginalObject(product: ProductMapper<ProductResponse>): ProductResponse {
    const productCopy = JSON.parse(JSON.stringify(product))
    delete productCopy.spinners;
    delete productCopy.isInCart;
    return productCopy;
  }

  // all metadata icons
  // forces to add icon if new metadata field is added to db
  // if icon depends on data, make sure it follows naming convention (key-value) (tier-classic) 
  private static _metadataIconMap: MetadataIconMap = new Map([
    ['price',        { iconName: 'dollar',           type: 'custom'   }],       
    ['downloadSize', { iconName: 'download',         type: 'mat-icon' }],
    ['tier-classic', { iconName: 'tier-premium',     type: 'custom'   }],
    ['tier-premium', { iconName: 'tier-premium',     type: 'custom'   }],
    ['resolution',   { iconName: 'image-resolution', type: 'custom'   }],
    ['extension',    { iconName: 'file-type-img',    type: 'custom'   }],
  ])

  
  // what metadata is displayed in the bottom section of single product
  // filter out product list icons to only include passed ones, order is important
  private static _getMetadataMap(
    metadataList: string[], 
    productMetadata: ProductTypePrintMetadata | ProductTypeShirtMetadata
  ) : MetadataIconMap {
    const map: MetadataIconMap = new Map();
    metadataList.forEach((key: string) => {
      // find by metadata key
      const icon = ProductMapper._metadataIconMap.get(key);
      if (!icon) {
        // find by metadata key + '-' + metadata value
        const sufix = '-' + productMetadata[key];
        const iconBasedOnData = ProductMapper._metadataIconMap.get(key + sufix);
        if (!iconBasedOnData) {
          throw new Error(`No icon for the specified metadata item: ${key}`)
        }
        map.set(key, iconBasedOnData);
      } else {
        map.set(key, icon);
      }
    })
    return map;
  }

}

interface MetadataIcon {
  iconName: string;
  type: 'mat-icon' | 'custom';
}

interface MetadataIconMap extends Map<string, MetadataIcon> {}
