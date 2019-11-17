import Component from '@ember/component';
import layout from '../../../templates/components/crunchy-form/fields/checkbox';
import { defineProperty } from '@ember/object';
import { alias } from '@ember/object/computed';

export default Component.extend({
  layout,
  form: null,
  model: null,
  field: '',

  disabled: false,
  didBlur: false,

  didReceiveAttrs() {
    this._super(...arguments);
    defineProperty(this, 'value', alias(`model.${this.field}`));
  },
});