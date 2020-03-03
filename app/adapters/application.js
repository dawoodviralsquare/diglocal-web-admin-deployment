import DS from 'ember-data';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import { isArray } from '@ember/array';
import ENV from 'diglocal-manage/config/environment';

export default DS.JSONAPIAdapter.extend({
  host: ENV.apiHost,

  namespace: 'api/v3',

  session: service(),

  get headers() {
    const headers = {};
    if (this.session.isAuthenticated) {
      const token = get(this, 'session.data.authenticated.credential.i');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  },

  handleResponse(status, headers, payload) {
    let responseObject = this._super(...arguments);

    if (responseObject && responseObject.isAdapterError) {
      let payloadObj = JSON.parse(payload);
      if (isArray(payloadObj.errors)) {
        responseObject.errors = payloadObj.errors;
      }
      responseObject.httpErrorResponse = {
        status,
        headers,
        payload: payloadObj
      };
    }

    return responseObject;
  }
});
