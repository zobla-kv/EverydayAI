import { animate, keyframes, state, style, transition, trigger } from "@angular/animations";

export default [
  trigger('loading', [
    state('loadingStarted', style({
      'opacity': '0',
      'transform': 'translateY(50px)'
    })),
    state('loadingEnded', style({
      'opacity': '1',
      'transform': 'translateY(0px)'
    })),
    transition('loadingStarted => loadingEnded', animate('300ms 200ms'))
    // transition('loadingStarted => loadingEnded', animate('300ms 0ms', keyframes([
    //   // keyfreams - control parts of animation (optional)
    //   // offset    - at which point we want to be there (4 steps means default offset is 0.25)
    //   // style({ 'transform': 'translateY(400px)', 'opacity': '0',   offset: 0 }),
    //   // style({ 'transform': 'translateY(100px)', 'opacity': '0.2', offset: 0.8 }),
    //   // style({ 'transform': 'translateY(50px)',  'opacity': '0.8', offset: 0.9 }),
    //   // style({ 'transform': 'translateY(0)',     'opacity': '1',   offset: 1 }),
    // ])))
  ])
]