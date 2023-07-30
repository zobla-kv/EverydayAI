import { animate, keyframes, query, stagger, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('productsLoaded', [
    transition('false => loaded', [
      query('.product-item-wrapper',
        [
          style({ 'opacity': '0', 'transform': 'translateY(50px)' }),
          stagger('100ms', animate('750ms ease-out', style({ 'opacity': '1', 'transform': 'translateY(0px)' })))
        ],
        { optional: true }
      )
    ])
  ])
]
