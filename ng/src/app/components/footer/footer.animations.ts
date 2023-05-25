import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('show', [
    state('false', style({
      'transform': 'translateY(32px)',
    })),
    state('true', style({
      'transform': 'translateY(0px)',
    })),
    transition('false <=> true', animate(600))
  ])
]
