import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('expand', [
    state('true', style({
      'height': '120px',
    })),
    state('false', style({
      'height': '80px',
    })),
    transition('false <=> true', animate('800ms ease-in-out'))
  ])
]
