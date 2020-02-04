import classic from 'ember-classic-decorator';
import { classNames, classNameBindings } from '@ember-decorators/component';
import { inject as service } from '@ember/service';
import { not } from '@ember/object/computed';
import Component from '@ember/component';
import { set, action } from '@ember/object';
import { task } from 'ember-concurrency';

@classic
@classNames('border rounded p-4 bg-white')
@classNameBindings('isEditing:bg-white')
export default class SocialForm extends Component {
  @service store;

  isEditing = false;

  @not('isEditing') isReadonly;

  showDestroyModal = false;

  init() {
    super.init(...arguments);
    set(this, 'categoryOptions', []);
    this.loadCategories.perform();
  }

  @task(function* () {
    let categories = yield this.store.findAll('category');
    set(this, 'categoryOptions', categories);
  })
  loadCategories;

  rollbackModel() {
    if (this.model && this.model.get('hasDirtyAttributes')) {
      this.model.rollbackAttributes();
    }
  }

  willDestroyElement() {
    this.rollbackModel();
    this.setProperties({
      showDestroyModal: false,
      isEditing: false
    });
    super.willDestroyElement(...arguments);
  }

  @action
  save() {
    this.model.save();
    this.set('isEditing', false);
  }

  @action
  cancel() {
    this.rollbackModel();
    this.set('isEditing', false);
  }

  @action
  delete() {
    this.model.deleteRecord();
    this.model.save();
    this.router.transitionTo('authenticated.businesses');
  }
}
