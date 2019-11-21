import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import removeFalsy from 'diglocal-manage/helpers/remove-falsy';
import moment from 'moment';

export default Route.extend(AuthenticatedRouteMixin, {
  ellaSparse: service(),

  queryParams: {
   search: { refreshModel: true },
   dateRange: { refreshModel: true }
  },
  breadCrumb: Object.freeze({
    title: 'Analytics'
  }),
  model(params) {
    return get(this, 'ellaSparse').array((range = {}, query = {}) => {
      // let { sort, filter } = getProperties(this, 'sort', 'filter');
      let page = {
        limit: get(range, 'length') || 10,
        offset: get(range, 'start') || 0
      };

      let filter = removeFalsy(params);
      filter.date_range = `${moment(params.dateRange[0]).format('YYYY-MM-DD')},${moment(params.dateRange[1]).format('YYYY-MM-DD')},day`;

      // Combine the pagination and filter parameters into one object
      // for Ember Data's .query() method
      query = Object.assign({ filter, page /*, sort */ }, query);
      query.include = 'business';

      // Return a Promise that resolves with the array of fetched data
      // and the total available records
      return this.store.query('impression-tracker', query).then((result) => {
        return {
          data: result,
          total: get(result, 'meta.page.total')
        }
      });
    });
  }
});
