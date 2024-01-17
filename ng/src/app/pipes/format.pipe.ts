import { Pipe, PipeTransform } from '@angular/core';

// format number with dot as thousand separator
// use only for whole number
@Pipe({
  name: 'format',
  pure: true
})
export default class FormatPipe implements PipeTransform {

  transform(value: number | null): string | null {
    if (!value) {
      return '';
    }
    return Intl.NumberFormat('it').format(Number(value));
  }

}
