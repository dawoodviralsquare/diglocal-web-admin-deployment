import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { isBlank } from '@ember/utils';
import { inject as service } from '@ember/service';
import { task, timeout } from 'ember-concurrency';
import removeEmpty from 'diglocal-manage/helpers/remove-empty';
import config from 'diglocal-manage/config/environment';

const INPUT_DEBOUNCE = config.environment !== 'test' ? 250 : 0;

export default class DetailsForm extends Component {
  @service regions;
  @service store;
  @service currentUser;
  @service router;
  @service notifications;

  @tracked showDestroyModal = false;
  @tracked showEventFields = true;
  @tracked showUploadModal = false;

  get showNextDate() {
    let { active, isRecurring, nextDate, hasDirtyAttributes } = this.args.model;
    if (hasDirtyAttributes) {
      let changedAttrs = Object.keys(this.args.model.changedAttributes());
      let hasChangedDates = changedAttrs.any((attr) => {
        return ['rawEventDate', 'postAt', 'recurringDisplayFrom', 'recurringDisplayTo'].includes(attr);
      });
      if (hasChangedDates) {
        return false;
      }
    }

    return active && isRecurring && nextDate;
  }

  constructor() {
    super(...arguments);
    if (isBlank(this.args.model.rawEventDate)) {
      this.showEventFields = false;
    }
  }

  rollbackModel() {
    if (this.args.rollbackModel) {
      return this.args.rollbackModel();
    }
  }

  willDestroy() {
    this.rollbackModel();
    this.showDestroyModal = false;
    super.willDestroy(...arguments);
  }

  @(task(function* (search) {
    yield timeout(INPUT_DEBOUNCE);
    let regionId = this.regions.activeRegion.id;
    let filter = Object.assign({}, { search, region: regionId });
    filter = removeEmpty(filter);
    return this.store.query('business', { filter });
  }).restartable())
  searchBusinesses;

  @task(function*() {
    yield this.args.model.reload();
    this.showUploadModal = false;
    this.router.transitionTo('authenticated.region.businesses.view.scoops.view', this.args.model.id);
  })
  onUploadImageComplete;

  @task(function*() {
    let model = yield this.args.model.save();
    this.isEditing = false;
    if (this.args.afterSave) {
      return this.args.afterSave(model);
    }
    this.notifications.success('Saved successfully!');
    return model;
  })
  saveTask;

  @task(function*() {
    yield this.args.model.deleteRecord();
    yield this.args.model.save();
    this.router.transitionTo('authenticated.region.businesses.view.scoops.index');
  })
  deleteTask;

  @action
  save() {
    return this.saveTask.perform();
  }

  @action
  cancel() {
    return this.rollbackModel();
  }

  @action
  delete() {
    return this.deleteTask.perform();
  }

  @action
  toggleEventFields(value) {
    this.showEventFields = value;
    if (!value) {
      this.args.model.rawEventDate = null;
      this.args.model.eventStartTime = null;
      this.args.model.eventEndTime = null;
    }
  }

  @action
  cancelUpload() {
    this.showUploadModal = false;
  }
}
