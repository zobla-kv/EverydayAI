import { animate, group, keyframes, query, stagger, state, style, transition, trigger } from "@angular/animations";

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
  ]),
  // old animation for preloader saved here for ref
  // trigger('appLoad', [
  //   state('true', style({ 'opacity': '0' })),
  //   transition('false => true', [
  //     group([
  //       query(':self', [animate('750ms 2250ms', style({ 'opacity': '0' }))])
  //     ])
  // ]),
  // ]),
]
