import { Pipe, PipeTransform } from '@angular/core';

// format number with dot as thousand separator
// use only for whole number
@Pipe({
  name: 'format',
  pure: true
})
export class FormatPipe implements PipeTransform {

  transform(value: number | null): string {
    // allow '0'
    if (value === undefined || value === null) {
      return '';
    }
    return Intl.NumberFormat('it').format(Number(value));
  }

}
