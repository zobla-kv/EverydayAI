import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, filter, first, fromEvent, tap } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';

import {
  FirebaseService,
  HttpService,
  ModalService,
  ToastService,
  UtilService
} from '@app/services';


// NOTE: Don't create products that have price over 99 (https://prnt.sc/Ybvghl_O0TKo)

import {
  ProductColor,
  ProductListConfig,
  ProductMapper,
  ProductResponse,
  ProductType,
  ToastMessages
} from '@app/models';

@Component({
  selector: 'app-c-panel',
  templateUrl: './c-panel.component.html',
  styleUrls: ['./c-panel.component.scss']
})
export class CPanelComponent implements OnInit, AfterViewInit {

  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChild('paginator') paginator: MatPaginator;

  // product load spinner
  showSpinner: boolean = true;

  // full product list ref
  fullProductList: ProductResponse[];

  // paginated list
  paginatedList: ProductMapper[];

  // page size for pagination
  pageSize = 4;

  // displayed columns
  displayedColumns: string[] = ['title', 'image', 'price', 'discount', 'likes', 'soldTimes', 'metadata', 'active', 'actions'];

  // add product form
  formAddProduct: FormGroup;

  // edit product form
  formEditProduct: FormGroup;

  // current product id
  productId: string;

  // filter color map
  filterColorMap: Map<string, string>;

  // list config
  config = ProductListConfig.C_PANEL;

  constructor(
    private _firebaseService: FirebaseService,
    public  utilService: UtilService,
    private _modalService: ModalService,
    private _httpService: HttpService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
    this.fetchProducts();
    this.filterColorMap = new Map(Object.keys(ProductColor).map(key => [key, ProductColor[key as keyof typeof ProductColor]]))

    this.formAddProduct = new FormGroup({
      'title': new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(24),
        // allow whitespaces between words but not on start and end
        Validators.pattern('^[a-zA-Z_]+( [a-zA-Z_]+)*$')
      ]),
      'image': new FormControl(null, [
        Validators.required
      ]),
      'description': new FormControl(null, [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(200),
        Validators.pattern('^[a-zA-Z_]+( [a-zA-Z_]+)*$')
      ]),
      'fileExtension': new FormControl(null, [
        Validators.required
      ]),
      'fileResolution': new FormControl(null, [
        Validators.required
      ]),
      'fileSize': new FormControl(null, [
        Validators.required
      ]),
      'fileSizeInMb': new FormControl(null, [
        Validators.required
      ]),
      'tier': new FormControl('classic', [
        Validators.required
      ]),
      'color': new FormControl(null, [
        Validators.required
      ]),
      'price': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]+(\.[0-9]+)?$')
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
        Validators.pattern('^[0-9]+(\.[0-9]+)?$')
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
      'color': new FormControl(null, [
        Validators.required
      ]),
      'likes': new FormControl(0, [
        Validators.required,
        Validators.pattern('^[0-9]*$')
      ]),
      'isActive': new FormControl()
    })
  }

  ngAfterViewInit() {
    this.searchInput && fromEvent(this.searchInput.nativeElement, 'keyup')
    .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => {
          if (!this.searchInput.nativeElement.value) {
            this.paginatedList = this.utilService.getFromRange(this.fullProductList, 0, this.pageSize - 1);
            this.paginator.length = this.fullProductList.length;
          } else {
            const filteredList = this.fullProductList.filter(item => {
              return item.title.toLowerCase().includes(this.searchInput.nativeElement.value.toLowerCase())
            })
            this.paginator.firstPage();
            this.paginatedList = this.utilService.getFromRange(
              filteredList,
              this.paginator.pageIndex * this.pageSize,
              this.pageSize - 1
            );
            this.paginator.length = filteredList.length;
          }
        })
    )
    .subscribe();
  }

  fetchProducts() {
    this._httpService.getProducts(ProductType.ALL, null).pipe(first()).subscribe((data: any) => {
      this.fullProductList = this.utilService.sortByCreationDate(data);
      this.paginator.length = this.fullProductList.length;

      // NOTE: this can be optimized to create them on page switch
      this.fullProductList = this.fullProductList.map(product => ProductMapper.getInstance(product, this.config, null));

      // NOTE: this needs to be done only once
      this.updatePaginatedList();
      this.showSpinner = false;

    });
  }

  // update list
  updateProductList() {
    this._httpService.getProducts(ProductType.ALL, null).pipe(first()).subscribe(data => {
      this.fullProductList = this.utilService.sortByCreationDate(data);
      this.paginator.length = this.fullProductList.length;
      this.updatePaginatedList();
    });
  }

  // handle image loading failure
  handleProductImgLoadError(ev: Event) {
    this.utilService.set404Image(ev.target);
  }

  // get items for next page
  updatePaginatedList(): void {
    this.paginatedList = this.utilService.getFromRange(
      this.fullProductList,
      this.paginator.pageIndex * this.pageSize,
      (this.paginator.pageIndex + 1) * this.pageSize - 1
    );
  }

  // open modal
  openModal(id: string) {
    this._modalService.open(id);
  }

  // when file changes in add product form
  async onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formAddProduct.patchValue({ fileExtension: this.utilService.getFileExtension(file.name) });
      this.formAddProduct.patchValue({ fileResolution: await this.utilService.getImageResolution(file) });
      this.formAddProduct.patchValue({ fileSize: file.size });
      this.formAddProduct.patchValue({ fileSizeInMb: this.utilService.getFileSizeInMb(file) });
      this.formAddProduct.patchValue({ image: file });
    }
  }

  async handleAddProduct() {
    const productTitle = this.formAddProduct.get('title')?.value;
    const productImgFile = this.formAddProduct.get('image')?.value;

    const isValid = this.isFormValid(this.formAddProduct);
    if (!isValid) {
      this._modalService.actionComplete$.next(false);
      return;
    }

    // NOTE: must be before upload to server to get productId
    this._firebaseService.addProduct(this.getProductObject())
    .then(async productId => {
      this.productId = productId;

      const fileName = productTitle;
      // prepare for upload
      const formData = new FormData();
      // set new name
      formData.append('image', productImgFile, fileName);

      const imgPaths = await this._httpService.uploadImage(formData);

      await this._firebaseService.updateProductAfterAdd(productId, imgPaths);

      await this._httpService.addProductToElasticSearch(productId);

      this._toast.showSuccessMessage(ToastMessages.CPANEL_PRODUCT_ADDED);

      // update list
      this.updateProductList();
    })
    .catch(err => {
      this._firebaseService.removeProduct(this.productId);

      // err.messsage only exists for cloudinary err, not firebase
      this._toast.showErrorMessage(err.cloudinary ?
        'Cloudinary: ' + err.cloudinary : err.elastic ?
        'Elastic: ' + err.elastic : ToastMessages.SOMETHING_WENT_WRONG, { duration: 4000 });
    })
    .finally(() => {
      this.clearAddProductFormAfterSubmit();
      this._modalService.actionComplete$.next(true);
    });
  }

  // clear fields and prepare for next
  clearAddProductFormAfterSubmit() {
    this.formAddProduct.reset();
    this.formAddProduct.patchValue({  image: null       });
    this.formAddProduct.patchValue({  description: null });
    this.formAddProduct.patchValue({  tier: 'classic'   });
    this.formAddProduct.patchValue({  color: null       });
    this.formAddProduct.patchValue({  discount: 0       });
    this.formAddProduct.patchValue({  likes: 0          });
  }

  // pre populate edit form
  populateEditForm(product: ProductResponse) {
    this.productId = product.id;
    this.formEditProduct.patchValue({ id: this.productId })
    Object.keys(this.formEditProduct.controls).forEach(key => {
      if (product[key as keyof ProductResponse] !== undefined) {
        this.formEditProduct.patchValue({ [key]: product[key as keyof ProductResponse] });
      }
      if (product.metadata[key] !== undefined) {
        this.formEditProduct.patchValue({ [key]: product.metadata[key] });
      }
    })
  }

  // update product
  handleUpdateProduct() {
    if (!this.formEditProduct.touched) {
      this._modalService.actionComplete$.next(true);
      return;
    }

    const isValid = this.isFormValid(this.formEditProduct) && this.validateDiscount(this.formEditProduct);
    if (!isValid) {
      this._modalService.actionComplete$.next(false);
      return;
    }

    this._firebaseService.updateProduct(this.formEditProduct.getRawValue())
    .then(() => {
      this.updateProductList();
      this._toast.showSuccessMessage(ToastMessages.CPANEL_PRODUCT_UPDATED);
    })
    .catch(err => {
      this._toast.showErrorMessage(ToastMessages.SOMETHING_WENT_WRONG);
    })
    .finally(() => {
      this.formEditProduct.reset();
      this._modalService.actionComplete$.next(true);
    });
  }

  // transform formData into ProductResponse
  // TODO: move to BE
  getProductObject(): ProductResponse {
    const formData = this.formAddProduct.getRawValue();

    return {
      // set later
      id: '',
      watermarkImgPath: '',
      originalImgPath: '',
      //
      creationDate: Timestamp.fromDate(new Date()),
      title: this.utilService.capitalizeText(formData.title),
      description: formData.description,
      price: Number(Number(formData.price).toFixed(2)),
      discount: Number(formData.discount),
      likes: Number(formData.likes),
      isActive: false,
      soldTimes: 0,
      isFree: (Number(formData.price) === 0 || Number(formData.discount) === 100) ? true : false,
      isDiscounted: Number(formData.discount) > 0 ? true : false,
      metadata: {
        fileSize: formData.fileSize,
        fileSizeInMb: formData.fileSizeInMb,
        resolution: formData.fileResolution,
        extension: formData.fileExtension,
        tier: formData.tier,
        color: formData.color,
        orientation: this.getImageOrientation(formData.fileResolution)
      }
    } as ProductResponse;
  }

  // is form valid
  isFormValid(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    } else {
      this.validateAllFormFields(form);
      if (this.validateDiscount(form) && form.valid) {
        return true;
      }
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

  // prevent discount of free items
  validateDiscount(form: FormGroup): boolean {
    const priceFieldValue = form.get('price')?.value;
    const discount = Number(form.get('discount')?.value);
    if (!priceFieldValue && discount > 0) {
      form.controls['discount'].setErrors({ priceNull: true });
      return false;
    }
    const price = Number(priceFieldValue).toFixed(2);
    if (priceFieldValue && price === '0.00' && discount > 0) {
      form.controls['discount'].setErrors({ freeItemDiscounted: true });
      return false;
    }
    return true;
  }

  // remove cross field validation errors
  removeDiscountValidationErrors(form: FormGroup) {
    const discountControl = form.controls['discount'];
    if (!discountControl.touched) {
      return;
    }
    // form is not reset on close when editing so this is active from start when switching edit forms (no issues)
    if (discountControl.hasError('priceNull') || discountControl.hasError('freeItemDiscounted')) {
      discountControl.setErrors(null);
    }
  }

  // get image orientation based on resolution
  getImageOrientation(resolution: string): any {
    const width = Number(resolution.split('x')[0]);
    const height = Number(resolution.split('x')[1]);
    if (width > height) {
      return 'landscape';
    }
    // if equal also portrait
    return 'portrait';
  }

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

  // prevent discount of free items - custom validator - left for ref
  // discountValidator(form: FormGroup): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     // get value of another field using control.parent
  //     const price = Number(control.parent?.get('price')?.value).toFixed(2);
  //     if (price && price === '0.00') {
  //       return { freeItemDiscounted: true };
  //     }
  //     return null;
  //   }
  // }

  // delete product
  // WARNING: this will also delete it from those who have bought it, figure out how to remove it from shop only
  // async handleDeleteProduct() {
  //   const target = this.fullProductList.find(item => item.id === this.productId) as ProductResponse;
  //   // remove from db
  //   this._firebaseService.removeProduct(this.productId)
  //   .then(res => {
  //     // remove image from server, catch will not catch this but don't care
  //     this._httpService.deleteItem(target.fileName).pipe(first()).subscribe();
  //     this.updateProductList();
  //     this._toast.open(ToastConstants.MESSAGES.CPANEL_PRODUCT_REMOVED, ToastConstants.TYPE.SUCCESS.type);
  //   })
  //   .catch(err => this._toast.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type))
  //   .finally(() => this._modalService.actionComplete$.next(true))
  // }

}
