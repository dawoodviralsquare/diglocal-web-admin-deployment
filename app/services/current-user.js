import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default class CurrentUserService extends Service {
  @service store;
  @service firebaseApp;
  @service('regions') regionsService;

  @tracked user;

  get isAdmin() {
    return this.userType === 'admin';
  }

  get isMultiBusinessOwner() {
    return this.userType === 'multi_owner';
  }

  get isSingleBusinessOwner() {
    return this.userType === 'single_owner';
  }

  get isRestricted() {
    return this.userType === 'restricted';
  }

  get canViewContent() {
    return this.user && !this.isRestricted;
  }

  get userType() {
    if (!this.user) {
      return null;
    }

    if (this.user && this.user.admin) {
      return 'admin';
    }
    if (this.user && !this.user.admin) {
      let businesses = this.user.businesses || [];
      if (isEmpty(businesses)) { return 'restricted'; }
      return businesses.length > 1 ? 'multi_owner' : 'single_owner';
    }
    return 'restricted';
  }

  async load() {
    return await this._load.perform();
  }

  @task(function*() {
    try {
      let { currentUser } = yield this.firebaseApp.auth();

      let includes = [
        'profileImages',
        'businesses',
        'businesses.region',
        'businesses.categories'
      ];

      let results = yield this.store.query('user', { filter: { firebaseId: currentUser.uid}, include: includes.join(',') });
      let userModel = results.firstObject;
      
      this.user = userModel;

      if (this.userType && this.isRestricted) {
        throw new Error('User does not have web admin privileges');
      }

      return userModel;
    } catch(e) {
      throw e;
    }
  })
  _load;
}
