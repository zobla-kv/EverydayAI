import { animate, keyframes, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('changePage', [
    state('show', style({
      'opacity': '1',
      'transform': 'translateX(0px)'
    })),
    state('hideLeft', style({
      'opacity': '0',
      'transform': 'translateX(20px)'
    })),
    state('hideRight', style({
      'opacity': '0',
      'transform': 'translateX(-20px)'
    })),
    transition('show => hideLeft', animate('750ms ease-in-out', keyframes([
      style({ 'opacity': '1', 'transform': 'translateX(-5px)', offset: 0.25 }),
      style({ 'opacity': '1', 'transform': 'translateX(-15px)', offset: 0.5 }),
      style({ 'opacity': '0.2', 'transform': 'translateX(-40px)', offset: 0.9 }),
      style({ 'opacity': '0', 'transform': 'translateX(-50px)', offset: 1 }),
    ]))),
    transition('show => hideRight', animate('750ms ease-in-out', keyframes([
      style({ 'opacity': '1', 'transform': 'translateX(5px)', offset: 0.25 }),
      style({ 'opacity': '1', 'transform': 'translateX(15px)', offset: 0.5 }),
      style({ 'opacity': '0.2', 'transform': 'translateX(40px)', offset: 0.9 }),
      style({ 'opacity': '0', 'transform': 'translateX(50px)', offset: 1 }),
    ]))),
    transition('hideLeft => show', animate(300)),
    transition('hideRight => show', animate(300)),
  ])
]
