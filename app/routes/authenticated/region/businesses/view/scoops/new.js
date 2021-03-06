import Route from '@ember/routing/route';

export default class AuthenticatedRegionBusinessesViewScoopsNewRoute extends Route {
  model() {
    let businessId = this.paramsFor('authenticated.region.businesses.view').business_id;
    let business = this.store.peekRecord('business', businessId);
    return this.store.createRecord('scoop', {
      business
    });
  }
}
