import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Clipboard } from '@angular/cdk/clipboard';

import { catchError, finalize, Subscription } from 'rxjs';

import {
  AuthService,
  HttpService,
  ModalService,
  PaymentService,
  StorageService,
  ToastService,
  UtilService
} from '@app/services';

import {
  CustomUser,
  ToastMessages
} from '@app/models';

import environment from '@app/environment';

import { promptExample, promptTips } from './data';

declare const paypal: any;

@Component({
  selector: 'app-generate-image',
  templateUrl: './generate-image.component.html',
  styleUrls: ['./generate-image.component.scss']
})
export class GenerateImageComponent implements OnInit, OnDestroy {
  // generate image form
  form: FormGroup;

  // prompt example text
  promptExample = promptExample;

  // prompt tips
  promptTips = promptTips;

  // show submit form spinner
  showSpinner = false;

  // generate image url
  imageUrl: string;

  // generated image orientation
  imageOrientation: 'landscape' | 'portrait';

  // custom user state
  userStateSub$: Subscription;

  // custom user
  user: CustomUser | null;

  // enable download
  enableDownload = true;

  constructor(
    private _authService: AuthService,
    private _httpService: HttpService,
    public utilService: UtilService,
    private _toast: ToastService,
    private _paymentService: PaymentService,
    private _modalService: ModalService,
    private _router: Router,
    private _storageService: StorageService,
    private _clipboard: Clipboard
  ) {
    this.loadPaypalScript();
  }

  ngOnInit() {
    this.userStateSub$ = this._authService.userState$.subscribe(user => this.user = user);

    this.form = new FormGroup({
      'device': new FormControl('mobile'),
      'prompt': new FormControl(null, [
        Validators.required
      ])
    });

    const previousData = this._storageService.getFromSessionStorage(this._storageService.storageKey.GENERATED_IMAGE_DATA);
    if (previousData) {
      const previousDataParsed = JSON.parse(previousData)
      this.form.setValue({
        device: previousDataParsed.device,
        prompt: previousDataParsed.prompt
      });
      this.imageUrl = previousDataParsed.image_url;
      this.imageOrientation = previousDataParsed.image_orientation;
      this._storageService.deleteFromSessionStorage(this._storageService.storageKey.GENERATED_IMAGE_DATA);
      setTimeout(() => this.handleBuy());
    };
  }

  // loads paypal script
  async loadPaypalScript(): Promise<void> {
    const paypalSdkUrl = 'https://www.paypal.com/sdk/js';
    const clientId = environment.paypal_client_id;
    const components = 'buttons' // card-fields not supported in Serbia

    this.utilService.loadScript(
      paypalSdkUrl + '?client-id=' + clientId + '&components=' + components + '&enable-funding=venmo'
    )
    .then(() => this.renderPaypalButtons())
    .catch(err => this._toast.showErrorMessage(ToastMessages.PAYMENT_SCRIPT_FAILED_TO_LOAD));
  }

  // renders paypal buttons
  renderPaypalButtons() {
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color:  'gold',
        shape:  'rect',
        label:  'paypal'
      },
      createOrder: (data: any, actions: any) => this._paymentService.createOrder((this.user as CustomUser).id, [''], true),
      onApprove: (data: any, actions: any) => {
        this._paymentService.handlePaymentApprove((this.user as CustomUser).id, data.orderID, [this.imageUrl], true)
        .then(() => {
          this._authService.updateUser();
          this.enableDownload = true;
          this._modalService.close();
          this._toast.showSuccessMessage(ToastMessages.PAYMENT_SUCCESSFUL_DOWNLOAD_ENABLED);
        })
        .catch(err => this._toast.showErrorMessage(ToastMessages.PAYMENT_FAILED_TO_PROCESS_PAYMENT));
      },
      onCancel: () => this._toast.showErrorMessage(ToastMessages.PAYMENT_PAYMENT_TERMINATED),
      onError: (err: any) => this._toast.showErrorMessage(ToastMessages.PAYMENT_FAILED_TO_INITIALIZE_PAYMENT)
    })
    .render('#paypalButtonsContainer');
  }

  // handle form submit
  handleSubmit () {
    if (this.form.invalid) {
      // only prompt can cause this
      this.form.get('prompt')?.markAsTouched();
      return;
    }

    const formData = this.form.getRawValue();
    this.showSpinner = true;
    this._httpService.getImageFromPrompt(formData.device, formData.prompt)
    .pipe(
      catchError(async (err: HttpErrorResponse ) => {
        if (err.error.status === 429) {
          this._toast.showErrorMessage(err.error.message, { duration: 4000 });
        } else {
          this._toast.showDefaultError();
        }
        return this.imageUrl ? this.imageUrl : '';
      }),
      finalize(() => this.showSpinner = false)
    )
    .subscribe(image_url => {
       this.imageUrl = image_url;
       this.setImageOrientation();
    })
  }

  // set image orientation after load
  setImageOrientation(): void {
    const img = new Image();
    img.onload = () => {
      this.imageOrientation = img.width > img.height ? 'landscape' : 'portrait';
    };
    img.src = this.imageUrl;
  }

  // show modal with prompt example
  showPromptExample() {
    this._modalService.open('prompt-example');
  }

  // handle buy button
  handleBuy() {
    if (!this.user) {
      this._modalService.open('auth');
      return;
    }
    this._modalService.open('payment');
  }

  // handle login
  handleLogin() {
    // store previous data to show it after auth
    if (this.imageUrl) {
      const previousData = {
        device: this.form.get('device')?.value,
        prompt: this.form.get('prompt')?.value,
        image_url: this.imageUrl,
        image_orientation: this.imageOrientation
      }
      this._storageService.storeToSessionStorage(this._storageService.storageKey.GENERATED_IMAGE_DATA, JSON.stringify(previousData));
    }

    this._router.navigate(['auth', 'login']);
    this._modalService.close();
  }

  // hanle download - this is FE download that differs from product list download
  async handleDownload() {
    try {
      const chunks = await this._httpService.downloadImageByUrl(this.imageUrl);
      const blob = new Blob(chunks);

      const fileName = this.getDownloadImageFileName();

      const a = document.createElement('a');
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
    catch (err) {
      this._toast.showErrorMessage(ToastMessages.PRODUCT_DOWNLOAD_FAILED);
    }
  }

  // handle copy button
  handleCopy() {
    const isCopied = this._clipboard.copy(this.promptExample);

    if (!isCopied) {
      this._toast.showErrorMessage(ToastMessages.COPY_PROMPT_CLIPBOARD_FAILED);
      return;
    }

    this._toast.showSuccessMessage(ToastMessages.COPY_PROMPT_CLIPBOARD_SUCCESSFUL);
    this._modalService.actionComplete$.next(true);
  }

  // create name of the file to download
  getDownloadImageFileName(): string {
    let fileName = 'everyday-ai.io_';
    const promptValue = this.form.get('prompt')?.value;

    if (!promptValue || promptValue.split(' ').length < 3) {
      const randomString = Math.random().toString(36).substring(2, 8); // lenght 6
      return fileName + randomString + '.jpg';
    }

    // Split the string into an array of words
    const wordsArray = this.form.get('prompt')?.value.split(' ');
    // Get the first three words as an array
    const firstThreeWords = wordsArray.slice(0, 3);
    // Concatenate the first three words into a single string
    const concatenatedString = firstThreeWords.join(' ');

    return fileName + concatenatedString + '.jpg';
  }

  ngOnDestroy() {
    this.userStateSub$ && this.userStateSub$.unsubscribe();
  }

}
