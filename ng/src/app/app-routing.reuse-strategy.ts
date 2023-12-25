import { ActivatedRouteSnapshot, DetachedRouteHandle, Params, RouteReuseStrategy } from "@angular/router"

interface RouteData {
  handle: DetachedRouteHandle;
  queryParams: Params;
  // call in shouldAttach only
  handlerFn: (handle: ActivatedRouteSnapshot) => boolean;
}

export class ReuseStrategy implements RouteReuseStrategy {

  private _storedRoutes = new Map<string, RouteData>();

  // function determininy if component shouldAttach
  private _routeHandlerFnMap = new Map<string, (route: ActivatedRouteSnapshot) => boolean>([
    // if there is some specific check to decice wheather to reuse or not
    ['products',      this.attachImmediately],
    ['control-panel', this.attachImmediately],
    ['cart',          this.attachImmediately]
  ]);

  // enable route reuse - this is called first
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  // if component should be stored for later use (if true store is called)
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    // routes to reuse
    const reuseRoutes = ['products', 'control-panel', 'cart'];
    const path = route.routeConfig?.path as string;
    return reuseRoutes.includes(path);
  }

  // store component for later use
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const path = route.routeConfig?.path || '';
    this._storedRoutes.set(path, { handle, queryParams: route.queryParams, handlerFn: this._routeHandlerFnMap.get(path)! });
  }

  // if component should be restored (if true retrieve is called)
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const path = route.routeConfig?.path || '';
    const handlerFn = this._routeHandlerFnMap.get(path);
    if (handlerFn) {
      return handlerFn.call(this, route);
    }
    return false;
  }

  // get component to be used
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const path = route.routeConfig?.path || '';
    return this._storedRoutes.get(path)!.handle;
  }

  // reuse without any check
  attachImmediately(route: ActivatedRouteSnapshot): boolean {
    // true if component should be reused
    if (this._storedRoutes.get(route.routeConfig?.path!)) {
      return true;
    }
    return false;
  }

}
