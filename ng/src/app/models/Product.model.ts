
import { CustomUser } from "./User.model";
import { Timestamp } from '@angular/fire/firestore';

export interface ProductResponse {
  id: string;
  title: string;
  price: number;
  discount: number;
  description: string;
  // fileName: string; replaced by imgPath
  imgPath: string;
  imgAlt: string; // TODO: remove this (description holds it)
  likes: number;
  isActive: boolean;
  metadata: ProductTypePrintMetadata | ProductTypeShirtMetadata;
  creationDate: Timestamp;
  // cant get 'or' and 'and' query to work
  isFree: boolean;
  isDiscounted: boolean;
}

export interface ProductTypePrint extends ProductResponse {
  metadata: ProductTypePrintMetadata
}

export interface ProductShirtPrint extends ProductResponse {
  metadata: ProductTypeShirtMetadata
}

interface ProductTypePrintMetadata {
  [key: string]: {
    fileSize: string;
    // exists only to avoid transforming it every time on FE
    fileSizeInMb: string;
    resolution: string;
    extension: string;
    tier: 'classic' | 'premium';
    color: ProductColor;
    orientation: 'portrait' | 'landscape';
  }
}

// TODO: comment out colors that contain no pictures, rather than displaying no results when filtered
export enum ProductColor {
  all = 'linear-gradient(70deg, #FF4136  30%, rgba(0,0,0,0) 30%), linear-gradient(30deg, #01FF70 60%, #0074D9 60%)',
  black = '#111111',
  blue = '#0074D9',
  brown = '#654321',
  green = '#01FF70',
  grey = '#DDDDDD',
  orange = '#FF851B',
  pink = '#F012BE',
  purple = '#B10DC9',
  red = '#FF4136',
  teal = '#39CCCC',
  white = '#FFFFFF',
  yellow = '#FFDC00'
}

export interface ProductFilters {
  [name: string]: {
    value: string;
    default: string;
    possibleValues: string[];
  }
}

export interface FilterEvent {
  filters: ProductFilters;
  targetFilter: string;
}

interface ProductTypeShirtMetadata {
  [key: string]: {
    size: 'SM' | 'XL' | 'XXL';
    color: string;
  }
}

// all actions for all products
export enum ProductActions {
  CART = 'cart',
  DOWNLOAD = 'download',
  LIKE = 'like',
}

export namespace ProductType {
  // all
  export enum ALL {
    ALL = 'all'
  }

  export enum PRINTS {
    SHOP = 'prints_shop',
    OWNED_ITEMS = 'prints_owned_items'
  }

}

export class ProductListConfig {

  title: string;
  product: { type: any, actions: ProductActions[], metadata: string[] }
  pageSize: number;

  public static HOME_PAGE_OUR_PICKS = {
    title: '',
    product: {
      type: ProductType.ALL,
      // download replaces action so isn't passed
      actions: [ProductActions.CART],
      metadata: []
    },
    pageSize: 3
  }

  public static PRODUCT_LIST_PRINTS = {
    TAB_SHOP: {
      title: 'Explore new products',
      product: {
        type: ProductType.PRINTS.SHOP,
        // download action not passed because it replaces cart action
        actions: [ProductActions.CART, ProductActions.LIKE],
        metadata: ['price', 'tier', 'extension', 'fileSizeInMb', 'resolution']
      },
      pageSize: 6
    },
    TAB_OWNED_ITEMS: {
      title: 'Download your items',
      product: {
        type: ProductType.PRINTS.OWNED_ITEMS,
        actions: [ProductActions.DOWNLOAD],
        metadata: ['resolution', 'extension', 'fileSizeInMb', 'tier']
      },
      pageSize: 6
    }
  }

  public static SHOPPING_CART = {
    title: '',
    product: {
      type: ProductType.ALL,
      actions: [ProductActions.CART],
      // TODO: not all will have same metadata
      metadata: ['tier', 'extension', 'resolution']
    },
    pageSize: 4
  }

}

// modify Product from BE to include FE properties
export class ProductMapper<T extends ProductResponse> implements ProductResponse {
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  imgPath: string;
  imgAlt: string;
  // TODO: type
  likes: number;
  isActive: boolean;
  metadata: ProductTypePrintMetadata | ProductTypeShirtMetadata;
  creationDate: Timestamp;
  isFree: boolean;
  isDiscounted: boolean;
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
    this.likes = product.likes;
    this.isActive = product.isActive;
    this.metadata = product.metadata;
    this.creationDate = product.creationDate;
    this.isFree = product.isFree;
    this.isDiscounted = product.isDiscounted;
    // spinner for each action
    this.spinners = Object.assign({}, ...config.product.actions.map(action => ({ [action]: false })));
    this.isInCart = ProductMapper._isInCart(product, config, user);
    this.metadataIconMap = ProductMapper.getMetadataIconMap(config.product.metadata, product.metadata);
  }

  // get original object to store in db (remove all client side properties)
  static getOriginalObject(product: ProductMapper<ProductResponse>): ProductResponse {
    // NOTE: be aware of the depth
    const productCopy = JSON.parse(JSON.stringify(product))
    delete productCopy.spinners;
    delete productCopy.isInCart;
    delete productCopy.metadataIconMap;
    delete productCopy.imgPath;
    return productCopy;
  }

  // all metadata icons
  // forces to add icon if new metadata field is added to db
  // if icon depends on data, make sure it follows naming convention (key-value) (tier-classic)
  private static _metadataIconMap: MetadataIconMap = new Map([
    ['price',        { iconName: 'dollar',           type: 'custom'   }],
    ['fileSizeInMb', { iconName: 'download',         type: 'mat-icon' }],
    ['tier-classic', { iconName: 'tier-classic',     type: 'custom'   }],
    ['tier-premium', { iconName: 'tier-premium',     type: 'custom'   }],
    ['resolution',   { iconName: 'image-resolution', type: 'custom'   }],
    ['extension',    { iconName: 'file-type-img',    type: 'custom'   }],
  ])


  // what metadata is displayed in the bottom section of single product
  // filter out product list icons to only include passed ones, order is important
  public static getMetadataIconMap(
    metadataList: string[],
    productMetadata: ProductTypePrintMetadata | ProductTypeShirtMetadata
  ): MetadataIconMap {
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

  // set isInCart property
  private static _isInCart(product: ProductResponse, config: ProductListConfig, user: CustomUser | null): boolean {
    if (!user || !config.product.actions.includes(ProductActions.CART)) {
      return false;
    }
    return user.cart.indexOf(product.id) === -1 ? false : true;
  }

}

interface MetadataIcon {
  iconName: string;
  type: 'mat-icon' | 'custom';
}

export interface MetadataIconMap extends Map<string, MetadataIcon> {}
