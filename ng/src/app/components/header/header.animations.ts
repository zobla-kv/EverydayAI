import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('expand', [
    state('true', style({
      'height': '120px',
    })),
    state('false', style({
      'height': '100px',
    })),
    transition('false <=> true', animate('300ms ease-in-out'))
  ])
]
