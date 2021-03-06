import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class AuthenticatedController extends Controller {
  @service session;
  @service currentUser;
}
