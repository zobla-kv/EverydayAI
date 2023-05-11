import { animate, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('expand', [
    state('true', style({
      'height': '140px',
      'box-shadow': 'none',
      // 'border-bottom': 'none'
    })),
    state('false', style({
      'height': '120px',
      'box-shadow': '0px 3px 48px rgba(0, 0, 0, 0.3)',
      // 'border-bottom': '1px solid white'
    })),
    transition('false <=> true', animate(300))
  ])
]
