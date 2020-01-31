import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import removeEmpty from 'diglocal-manage/helpers/remove-empty';
import { hash } from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  ellaSparse: service(),

  queryParams: {
   search: { refreshModel: true },
   sort: { refreshModel: true },
   featured: { refreshModel: true },
   categories: { refreshModel: true },
   roles: { refreshModel: true },
  },

  breadCrumb: Object.freeze({
    title: 'Businesses'
  }),

  model(params) {
    let businesses = get(this, 'ellaSparse').array((range = {}, query = {}) => {
      let page = {
        limit: get(range, 'length') || 10,
        offset: get(range, 'start') || 0
      };

      // Route specific query formatting
      this._formatQuery(params);

      let filter = removeEmpty(params);

      let sort = filter.sort;
      delete filter.sort;

      // Combine the pagination and filter parameters into one object
      // for Ember Data's .query() method
      query = Object.assign({ filter, page, sort }, query);
      query.include = 'categories,users';

      // Return a Promise that resolves with the array of fetched data
      // and the total available records
      return this.store.query('business', query).then((result) => {
        return {
          data: result,
          total: get(result, 'meta.page.total')
        }
      });
    });

    return hash({
      businesses,
      categories: this.store.findAll('category')
    });
  },

  _formatQuery(params) {
    // backend wants filter attr named 'role'
    params.role = params.roles;
    delete params.roles;
    // filtering by 'featured' only is applicable when true
    if (params.featured === false) {
      delete params.featured;
    }
    return params;
  },

  setupController(controller, hash) {
    let { businesses, categories } = hash;
    this._super(...arguments);
    controller.setProperties({
      model: businesses,
      categoryOptions: categories
    })
  },

  resetController(controller, isExiting, transition) {
    if (isExiting && transition.targetName !== 'error') {
      controller.setProperties({
        roles: [],
        categories: [],
        search: '',
        searchString: '',
        featured: false,
        sort: ''
      });
    }
  },

  actions: {
    create() {
      let record = this.store.createRecord('business');
      this.transitionTo('authenticated.businesses.edit', record);
    },
    loading(transition) {
      let controller = this.controllerFor('authenticated.businesses.index');
      controller.set('isLoading', true);
      transition.promise.finally(function() {
        controller.set('isLoading', false);
      });
    }
  }
});
