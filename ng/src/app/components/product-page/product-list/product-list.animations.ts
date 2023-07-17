import { animate, keyframes, query, stagger, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('productsLoaded', [
    // good animation but doesnt work well with spinner or image loading (when it needs to be delayed)
    // transition('* <=> *', [
    //   query(':enter .product-item-wrapper',
    //     [
    //       style({ 'opacity': '0', 'transform': 'translateY(50px)' }),
    //       stagger('100ms', animate('750ms ease-out', style({ 'opacity': '1', 'transform': 'translateY(0px)' })))
    //     ],
    //     { optional: true }
    //   )
    // ])

    // figured it out
    // animate false => 'loaded' 
    // ignore void => false
    transition('false <=> loaded', [
      query('.product-item-wrapper',
        [
          style({ 'opacity': '0', 'transform': 'translateY(50px)' }),
          stagger('100ms', animate('750ms ease-out', style({ 'opacity': '1', 'transform': 'translateY(0px)' })))
        ],
        { optional: true }
      )
    ])
  ]),
  trigger('changePage', [
    state('show', style({
      'opacity': '1',
      'transform': 'translateY(0px)'
    })),
    state('hideLeft', style({
      'opacity': '0',
      'transform': 'translateY(20px)'
    })),
    state('hideRight', style({
      'opacity': '0',
      'transform': 'translateY(-20px)'
    })),
    transition('show => hideLeft', animate('750ms ease-in-out', keyframes([
      style({ 'opacity': '1', 'transform': 'translateY(-5px)', offset: 0.25 }),
      style({ 'opacity': '1', 'transform': 'translateY(-15px)', offset: 0.5 }),
      style({ 'opacity': '0.2', 'transform': 'translateY(-40px)', offset: 0.9 }),
      style({ 'opacity': '0', 'transform': 'translateY(-50px)', offset: 1 }),
    ]))),
    transition('show => hideRight', animate('750ms ease-in-out', keyframes([
      style({ 'opacity': '1', 'transform': 'translateY(5px)', offset: 0.25 }),
      style({ 'opacity': '1', 'transform': 'translateY(15px)', offset: 0.5 }),
      style({ 'opacity': '0.2', 'transform': 'translateY(40px)', offset: 0.9 }),
      style({ 'opacity': '0', 'transform': 'translateY(50px)', offset: 1 }),
    ]))),
    transition('hideLeft => show', animate(300)),
    transition('hideRight => show', animate(300)),
  ])
]
