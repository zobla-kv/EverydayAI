import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('show', [
    state('false', style({
      // 'transform': 'translateY(32px)',
      'transform': 'scale(0.95)',
    })),
    state('true', style({
      // 'transform': 'translateY(0px)',
      'transform': 'scale(1)',
    })),
    transition('false <=> true', animate(200))
  ])
]
