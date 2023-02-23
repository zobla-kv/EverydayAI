import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('loadingDone', [
    state('false', style({
      'opacity': '0',
      'transform': 'translateX(10px)',
      // 'border-bottom': '1px solid rgba(255, 255, 255, 0)',
    })),
    state('true', style({
      'opacity': '1',
      'transform': 'translateX(0px)',
      // 'border-bottom': '1px solid rgba(255, 255, 255, 1)'
    })),
    transition('false => true', animate('400ms ease-in'))
  ])
]