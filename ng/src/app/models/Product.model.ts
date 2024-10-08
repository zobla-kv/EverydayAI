
import { CustomUser } from "./User.model";
import { Timestamp } from '@angular/fire/firestore';

export interface ProductResponse {
  id: string;
  title: string;
  price: number;
  discount: number;
  description: string;
  watermarkImgPath: string;
  originalImgPath: string;
  likes: number;
  isActive: boolean;
  metadata: ProductTypePrintMetadata | ProductTypeShirtMetadata;
  creationDate: Timestamp;
  soldTimes: number;
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

export enum ProductColor {
  all = 'linear-gradient(70deg, #FF4136  30%, rgba(0,0,0,0) 30%), linear-gradient(30deg, #01FF70 60%, #0074D9 60%)',
  black = '#111111',
  blue = '#0074D9',
  brown = '#B36E4B',
  green = '#01FF70',
  grey = '#57595A',
  orange = '#FF851B',
  pink = '#F012BE',
  purple = '#7B1EC5',
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
  filterName: string;
  filterValue: string;
}

// NOTE: unused
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

// TODO: refactor further, remove product. Also not used correctly everywhere
export class ProductListConfig {

  // all metadata
  static metadataList = ['price', 'tier', 'resolution', 'extension', 'fileSizeInMb', 'likes'];

  product: {
    actions: ProductActions[],
    // what metadata is shown - done in html
    metadata: string[]
  }

  public static HOME_PAGE_OUR_PICKS = {
    product: {
      // download replaces action so isn't passed
      actions: [ProductActions.CART],
      // TODO: not implemented with this
      metadata: []
    }
  }

  public static PRODUCT_LIST = {
    product: {
      // download replaces cart action so isn't passed
      actions: [ProductActions.CART, ProductActions.LIKE],
      metadata: ['price', 'tier', 'resolution', 'extension', 'fileSizeInMb', 'likes']
    }
  }

  public static SHOPPING_CART = {
    product: {
      actions: [ProductActions.CART],
      // metadata: ['tier', 'extension', 'resolution']
      metadata: ['tier', 'extension', 'resolution']
    }
  }

  public static C_PANEL = {
    product: {
      actions: [],
      metadata: ['tier', 'resolution', 'extension', 'fileSizeInMb']
    }
  }

  // old (used only in old component) - saved for ref
  // public static PRODUCT_LIST_PRINTS = {
  //   TAB_SHOP: {
  //     title: 'Explore new products',
  //     product: {
  //       type: ProductType.PRINTS.SHOP,
  //       // download action not passed because it replaces cart action
  //       actions: [ProductActions.CART, ProductActions.LIKE],
  //       metadata: ['price', 'tier', 'extension', 'fileSizeInMb', 'resolution']
  //     },
  //     pageSize: 6
  //   },
  //   TAB_OWNED_ITEMS: {
  //     title: 'Download your items',
  //     product: {
  //       type: ProductType.PRINTS.OWNED_ITEMS,
  //       actions: [ProductActions.DOWNLOAD],
  //       metadata: ['resolution', 'extension', 'fileSizeInMb', 'tier']
  //     },
  //     pageSize: 6
  //   }
  // }

}

// modify Product from BE to include FE properties
export class ProductMapper implements ProductResponse {
  // singleton for each product id
  // prevent bugs caused by inconsistent product object across pages (multiple sources of truth)
  private static instances = new Map<string, ProductMapper>();

  // added FE properties
  public spinners: any;
  public isInCart: boolean;
  public metadataIconMap: MetadataIconMap;

  private constructor(
    product: ProductResponse, config: ProductListConfig, user: CustomUser | null,
    public id: string = product.id,
    public title: string = product.title,
    public description: string = product.description,
    public price: number = product.price,
    public discount: number = product.discount,
    public watermarkImgPath: string = product.watermarkImgPath,
    public originalImgPath: string = product.originalImgPath,
    public likes: number = product.likes,
    public isActive: boolean = product.isActive,
    public metadata: ProductTypePrintMetadata | ProductTypeShirtMetadata = product.metadata,
    public creationDate: Timestamp = product.creationDate,
    public soldTimes: number = product.soldTimes,
    public isFree: boolean = product.isFree,
    public isDiscounted: boolean = product.isActive,
  ) {
    // spinner for each action
    this.spinners = Object.assign({}, ...config.product.actions.map(action => ({ [action]: false })));
    this.isInCart = ProductMapper._isInCart(product, config, user);
    this.metadataIconMap = ProductMapper._getMetadataIconMap(ProductListConfig.metadataList, product.metadata);
  }

  public static getInstance(product: ProductResponse, config: ProductListConfig, user: CustomUser | null): ProductMapper {
    if (!ProductMapper.instances.get(product.id)) {
      ProductMapper.instances.set(product.id, new ProductMapper(product, config, user));
    }
    return ProductMapper.instances.get(product.id) as ProductMapper;
  }

  // get original object to store in db (remove all client side properties)
  // TODO: unused - remove?
  static getOriginalObject(product: ProductMapper): ProductResponse {
    // NOTE: be aware of the depth
    const productCopy = JSON.parse(JSON.stringify(product))
    delete productCopy.spinners;
    delete productCopy.isInCart;
    delete productCopy.metadataIconMap;
    delete productCopy.watermarkImgPath;
    return productCopy;
  }

  // all metadata icons
  // forces to add icon if new metadata field is added to db
  // if icon depends on data, make sure it follows naming convention (key-value) (tier-classic)
  private static _metadataIconMap: MetadataIconMap = new Map([
    ['price',        { iconName: 'dollar',           type: 'custom'   }],
    ['fileSizeInMb', { iconName: 'download',         type: 'mat-icon' }],
    // NOTE: tier icons are overriden in styles.scss due to material bug displaying all icons the same in list
    ['tier-classic', { iconName: 'tier-classic',     type: 'custom'   }],
    ['tier-premium', { iconName: 'tier-premium',     type: 'custom'   }],
    ['resolution',   { iconName: 'image-resolution', type: 'custom'   }],
    ['extension',    { iconName: 'file-type-img',    type: 'custom'   }],
    ['likes',        { iconName: 'favorite',         type: 'mat-icon' }],
  ])


  // what metadata is displayed in the bottom section of single product
  // filter out product list icons to only include passed ones, order is important
  private static _getMetadataIconMap(
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

export interface ProductUploadResponse {
  watermarkImgPath: string;
  originalImgPath: string;
}
