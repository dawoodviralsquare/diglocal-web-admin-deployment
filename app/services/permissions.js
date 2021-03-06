import classic from 'ember-classic-decorator';
import { readOnly } from '@ember/object/computed';
import Service from '@ember/service';
import { get, set, computed } from '@ember/object';
import { capitalize, classify } from '@ember/string';
import { inject as service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { assert } from '@ember/debug';
import { getOwner } from '@ember/application';

@classic
class PermissionsService extends Service {
  @service('session')
  session;

  @readOnly('session.isAuthenticated')
  isAuthenticated;

  @(computed('session.data.authenticated.user', 'isAuthenticated').readOnly())
  get authenticatedUser() {
    let isAuthenticated = get(this, 'isAuthenticated');

    if (!isAuthenticated) {
      return null;
    }

    return get(this, 'session.data.authenticated.user');
  }

  permissionPropertyName(recordType, forAction) {
    return `can${classify(forAction)}${classify(recordType)}Attribute`;
  }

  permissionToModify(attribute, record) {
    assert(
      'permissionToModify() requires two arguments: permissionToModify(attribute, record)',
      !isBlank(attribute) && !isBlank(record)
    );

    let recordType = get(record, 'constructor.modelName') || '';
    let authenticatedUser = get(this, 'authenticatedUser');
    let createPermissions = get(this, this.permissionPropertyName(recordType, 'create'));
    let updatePermissions = this._permissionsForRecord(record) || get(this, this.permissionPropertyName(recordType, 'update'));
    let owner = getOwner(this);
    let permit = owner.lookup(`permission:${recordType}`) || owner.lookup('permission:application');

    let result = permit.compute({
      attribute,
      record,
      updatePermissions,
      createPermissions,
      authenticatedUser
    });

    return result;
  }

  updatePermissions(permissions) {
    this._updatePermissions(permissions, 'update');
    this._updatePermissions(permissions, 'create');
  }

  _updatePermissions(permissions, forAction) {
    let editable = get(permissions || {}, `can${capitalize(forAction)}`) || {};

    for (let key in editable) {
      let permissions = editable[key];
      let property = this.permissionPropertyName(key, forAction);
      let result = {};

      permissions.forEach((permission) => {
        result[permission] = true;
      });

      set(this, property, result);
    }
  }

  _permissionsForRecord(record) {
    let recordType = get(record || {}, 'constructor.modelName');

    if (isBlank(recordType)) {
      return null;
    }

    return get(this, this.permissionPropertyName(`${recordType}:${record.get('id')}`, 'update'));
  }
}

export default PermissionsService;
