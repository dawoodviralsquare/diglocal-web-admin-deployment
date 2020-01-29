import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class LoginRoute extends Route {
  @service session;

  beforeModel() {
    if (this.session.isAuthenticated) {
      this.replaceWith('/');
    }
  }
}
