import { FormGroup } from "@angular/forms";

export interface Form {
  form: FormGroup;
  type: string | undefined;
}

export enum FormType {
  LOGIN = 'login',
  REGISTER = 'register'
}
