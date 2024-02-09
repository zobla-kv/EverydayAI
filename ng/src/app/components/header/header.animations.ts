import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('expand', [
    state('true', style({
      'transform': 'translateY(-140px)',
      // 'height': '120px',
    })),
    state('false', style({
      'transform': 'translateY(0)',
      // 'height': '100px',
    })),
    transition('false <=> true', animate('600ms ease-in-out'))
  ])
]
