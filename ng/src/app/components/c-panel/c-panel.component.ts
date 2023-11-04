import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';

import { catchError, debounceTime, distinctUntilChanged, filter, first, fromEvent, map, tap } from 'rxjs';

import {
  FirebaseService,
  HttpService,
  ModalService,
  ToastService,
  UtilService
} from '@app/services';

import {
  MetadataIconMap,
  ProductMapper,
  ProductResponse,
  ProductType,
  ToastConstants
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
  paginatedList: ProductResponse[];

  // page size for pagination
  pageSize = 4;

  // displayed columns
  displayedColumns: string[] = ['title', 'image', 'price', 'discount', 'likes', 'metadata', 'actions'];

  // add product form
  formAddProduct: FormGroup;

  // edit product form
  formEditProduct: FormGroup;

  // current product id
  productId: string;

  // metadata icon map
  metadataIconMap: MetadataIconMap;

  constructor(
    private _firebaseService: FirebaseService,
    public  utilService: UtilService,
    private _modalService: ModalService,
    private _httpService: HttpService,
    private _toast: ToastService
  ) { }

  ngOnInit() {
    this.fetchProducts();

    this.formAddProduct = new FormGroup({
      'title': new FormControl(null, [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(16),
        // allow whitespaces between words but not on start and end
        Validators.pattern('^[a-zA-Z_]+( [a-zA-Z_]+)*$')
      ]),
      'image': new FormControl(null, [
        Validators.required
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
      'tier': new FormControl('classic', [
        Validators.required
      ]),
      'price': new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{1}.*$')
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
        Validators.pattern('^[0-9.]*$')
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
      // NOTE: this needs to be done only once
      this.updatePaginatedList();
      this.showSpinner = false;

      if (this.fullProductList.length > 0) {
        // TODO: this causes bug with premium displayed as classic
        this.metadataIconMap = ProductMapper.getMetadataIconMap(
          ['tier', 'resolution', 'extension', 'downloadSize'],
          this.fullProductList[0].metadata
        );
      }
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

  openModal(id: string) {
    this._modalService.open(id);
  }

  // when file changes in add product form
  async onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formAddProduct.patchValue({  })
      this.formAddProduct.patchValue({ fileExtension: this.utilService.getFileExtension(file.name) });
      this.formAddProduct.patchValue({ fileResolution: await this.utilService.getImageResolution(file) });
      this.formAddProduct.patchValue({ fileSize: this.utilService.getFileSize(file) });
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
    this._firebaseService.addProduct(this.getProductObject())
    .then(async productId => {
      this.productId = productId;
      // rename
      const fileName = productId + '.' + this.formAddProduct.get('fileExtension')?.value;
      await this._firebaseService.updateProductAfterAdd(productId, fileName);

      // prepare for upload
      const formData = new FormData();
      // set new name
      formData.append('image', productImgFile, fileName);

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
      this.clearAddProductFormAfterSubmit();
      this._modalService.actionComplete$.next(true);
    });
  }

  // clear fields and prepare for next
  clearAddProductFormAfterSubmit() {
    this.formAddProduct.reset();
    this.formAddProduct.patchValue({  image: null     });
    this.formAddProduct.patchValue({  tier: 'classic' });
    this.formAddProduct.patchValue({  discount: 0     });
    this.formAddProduct.patchValue({  likes: 0        });
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
  // NOTE: this will also delete it from those who have bought it, figure out how to remove it from shop only
  async handleDeleteProduct() {
    const target = this.fullProductList.find(item => item.id === this.productId) as ProductResponse;
    // remove from db
    this._firebaseService.removeProduct(this.productId)
    .then(res => {
      // remove image from server, catch will not catch this but don't care
      this._httpService.deleteItem(target.fileName).pipe(first()).subscribe();
      this.updateProductList();
      this._toast.open(ToastConstants.MESSAGES.PRODUCT_REMOVED_SUCCESSFUL, ToastConstants.TYPE.SUCCESS.type);
    })
    .catch(err => this._toast.open(ToastConstants.MESSAGES.SOMETHING_WENT_WRONG, ToastConstants.TYPE.ERROR.type))
    .finally(() => this._modalService.actionComplete$.next(true))
  }


  // create product object to store in db
  // TODO: move to BE
  getProductObject(): ProductResponse {
    const formData = this.formAddProduct.getRawValue();

    const dataCopy = this.utilService.getDeepCopy(formData);
    delete dataCopy.image;
    delete dataCopy.fileExtension;
    delete dataCopy.fileResolution;
    delete dataCopy.fileSize;

    const product: ProductResponse = {
      ...dataCopy,
      // set later
      id: '',
      fileName: '',
      // set in http service
      imgPath: '',
      //
      imgAlt: formData.title,
      price: Number(formData.price).toFixed(2),
      discount: Number(formData.discount),
      metadata: {
        downloadSize: formData.fileSize,
        resolution: formData.fileResolution,
        extension: formData.fileExtension,
        tier: formData.tier
      }
    };

    return product;
  }

  // is form valid
  isFormValid(form: FormGroup): boolean {
    if (form.valid) {
      return true;
    } else {
      this.validateAllFormFields(form);
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

  // keep order of keyvalue pipe (not DRY)
  keepOrder() { return 0; }

}
