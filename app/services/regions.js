import Service from '@ember/service';
import { storageFor } from 'ember-local-storage';
import { tracked } from '@glimmer/tracking';

export default class RegionsService extends Service {
  @storageFor('active-settings') activeSettingsStorage;

  constructor() {
    super(...arguments);
    this.regions = [];
  }

  @tracked regions = null;
  @tracked activeRegion = null;
  @tracked activeBusiness = null;
}
