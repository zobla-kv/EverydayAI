import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { debounceTime, distinctUntilChanged, filter, first, fromEvent, tap } from 'rxjs';

import { 
  FirebaseService,
  HttpService,
  ModalService,
  ToastService,
  UtilService 
} from '@app/services';

import { 
  ProductResponse, ToastConstants 
} from '@app/models';

@Component({
  selector: 'app-c-panel',
  templateUrl: './c-panel.component.html',
  styleUrls: ['./c-panel.component.scss']
})
export class CPanelComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  // product load spinner
  showSpinner: boolean = true;
  
  // product list (should be paginated)
  data: ProductResponse[];

  // full product list ref
  fullProductList: ProductResponse[];

  // displayed columns
  displayedColumns: string[] = ['title', 'image', 'price', 'discount', 'likes', 'actions'];

  // add product form
  formAddProduct: FormGroup;

  // edit product form
  formEditProduct: FormGroup;

  // current product id
  productId: string;

  constructor(
    private _firebaseService: FirebaseService,
    private _utilService: UtilService,
    private _modalService: ModalService,
    private _httpService: HttpService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
    this._firebaseService.getAllProducts().pipe(first()).subscribe(data => {
      this.fullProductList = data;
      this.data = data;
      this.showSpinner = false;
    });

    this.formAddProduct = new FormGroup({
      'title': new FormControl(null, [
        Validators.required, 
        Validators.minLength(6), 
        Validators.maxLength(16), 
        Validators.pattern('^[a-zA-Z]*$')
      ]),
      'image': new FormControl(null, [
        Validators.required
      ]),
      'tier': new FormControl('classic', [
        Validators.required
      ]),
      'price': new FormControl(null, [
        Validators.required, 
        Validators.pattern('^[0-9]*$')
      ]),
      'discount': new FormControl(0, [
        Validators.required, 
        Validators.min(0), 
        Validators.max(100), 
        Validators.pattern('^[a-zA-Z0-9]*$')
      ]),
      'likes': new FormControl(0, [
        Validators.required, 
        Validators.pattern('^[0-9]*$')
      ]),
    });

    this.formEditProduct = new FormGroup({
      'id': new FormControl(null, [
        Validators.required
      ]),
      'price': new FormControl(null, [
        Validators.required, 
        Validators.pattern('^[0-9]*$')
      ]),
      'discount': new FormControl(0, [
        Validators.required, 
        Validators.min(0), 
        Validators.max(100), 
        Validators.pattern('^[0-9]*$')
      ]),
      'tier': new FormControl(null, [
        Validators.required, 
      ]),
      'likes': new FormControl(0, [
        Validators.required, 
        Validators.pattern('^[0-9]*$')
      ]),
    })
  }

  ngAfterViewInit() {
    // server-side search
    fromEvent(this.searchInput.nativeElement,'keyup')
    .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          if (!this.searchInput.nativeElement.value) {
            this.data = this.fullProductList;
          } else {
            this.data = this.fullProductList.filter(item => {
              return item.title.toLowerCase().includes(this.searchInput.nativeElement.value.toLowerCase())
            })
          }
        })
    )
    .subscribe();
  }

  // update list
  updateProductList() {
    this._firebaseService.getAllProducts().pipe(first()).subscribe(data => {
      this.fullProductList = data;
      this.data = data;
    });
  }

  handleProductImgLoadError(ev: Event) {
    this._utilService.set404Image(ev.target);
  }

  openModal(id: string) {
    this._modalService.open(id);
  }

  // when file changes in add product form
  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formAddProduct.patchValue({ image: file });
    }
  }

  // when tier changes in select
  onTierChange(ev: any) {
    this.formAddProduct.patchValue({ tier: ev.target.value });
  }

  async handleAddProduct() {
    const productImgFile = this.formAddProduct.get('image')?.value;

    const isValid = this.isFormValid(this.formAddProduct);
    if (!isValid) {
      this._modalService.actionComplete$.next(false);
      return;
    }
    
    // NOTE: must be before upload to server to get productId
    this._firebaseService.addProduct(await this.getProductObject())
    .then(async productId => {
      this.productId = productId;
      // rename
      const fileName = productId + '.' + this._utilService.getFileExtension(productImgFile.name);
      await this._firebaseService.updateProductAfterAdd(productId, fileName);

      // prepare for upload
      const formData = new FormData();
      // set new name
      formData.append('image', productImgFile, fileName);

      // TODO: stopped here, figure out how to display image from db path, fill other metadata
      await this._httpService.uploadFile(formData);

      this._toast.open(ToastConstants.MESSAGES.NEW_PRODUCT_ADDED_SUCCESSFUL, ToastConstants.TYPE.SUCCESS.type);

      // update list
      this.updateProductList();
    })
    .catch(err => {
      this._firebaseService.removeProduct(this.productId);
      this._toast.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type);
    })
    .finally(() => {
      this.formAddProduct.reset();
      this._modalService.actionComplete$.next(true);
    });
  }

  // pre populate edit form
  populateEditForm(product: ProductResponse) {
    this.productId = product.id;
    this.formEditProduct.patchValue({ id: this.productId })
    Object.keys(this.formEditProduct.controls).forEach(key => {
      if (product[key as keyof ProductResponse]) {
        this.formEditProduct.patchValue({ [key]: product[key as keyof ProductResponse] });
      }
      if (product.metadata[key]) {
        this.formEditProduct.patchValue({ [key]: product.metadata[key] });
      }
    })
  }

  // update product
  handleUpdateProduct() {
    const isValid = this.isFormValid(this.formEditProduct);
    if (!isValid) {
      this._modalService.actionComplete$.next(false);
      return;
    }

    this._firebaseService.updateProduct(this.formEditProduct.getRawValue())
    .then(() => {
      this.updateProductList();
      this._toast.open(ToastConstants.MESSAGES.PRODUCT_UPDATED_SUCCESSFUL, ToastConstants.TYPE.SUCCESS.type);
    })
    .catch(err => {
      this._toast.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type);
    })
    .finally(() => {
      this.formEditProduct.reset();
      this._modalService.actionComplete$.next(true);
    });
  }

  // delete product
  handleDeleteProduct() {
    console.log('product id delete: ', this.productId);
    this._firebaseService.removeProduct(this.productId)
    .then(() => {
      this.updateProductList();
      this._toast.open(ToastConstants.MESSAGES.PRODUCT_REMOVED_SUCCESSFUL, ToastConstants.TYPE.SUCCESS.type);
    })
    .catch(err => {
      this._toast.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type);
    })
    .finally(() => {
      this._modalService.actionComplete$.next(true);
    });
  }


  // create product object to store in db
  // TODO: move to BE
  async getProductObject(): Promise<ProductResponse> {
    const formData = this.formAddProduct.getRawValue();

    const dataCopy = this._utilService.getDeepCopy(formData);
    delete dataCopy.fileName;
    delete dataCopy.image;
    // set later
    delete dataCopy.tier;

    const product: ProductResponse = { 
      ...dataCopy, 
      // set later
      id: '',
      // depends on patchValue
      imgPath: formData.image.name,
      imgAlt: this.formAddProduct.get('title')?.value,
      metadata: {
        downloadSize: this._utilService.getFileSize(this.formAddProduct.get('image')?.value),
        // TODO: move this to onFileChange
        resolution: await this._utilService.getImageResolution(this.formAddProduct.get('image')?.value),
        extension: this._utilService.getFileExtension(formData.image.name),
        tier: this.formAddProduct.get('tier')?.value
      }
    };

    return product;
  }

  // is form valid
  isFormValid(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    } else {
      return false;
    }
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}
