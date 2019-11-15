import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { computed, get } from '@ember/object';

export default Model.extend({
  active: attr(),
  admin: attr(),
  businessName: attr(),
  email: attr(),
  favoritesCount: attr(),
  hasProfile: attr(),
  isPublic: attr(),
  lastSignInAt: attr(),
  phoneNumbers: attr(),
  signInCount: attr(),
  user: attr(),

  publicName: attr(),
  givenName: attr(),
  middleName: attr(),
  surname: attr(),
  nickname: attr(),
  gender: attr(),
  birthdate: attr(),
  birthdateFormat: attr(),
  location: attr(),
  timezone: attr(),
  bio: attr(),
  headline: attr(),

  businesses: hasMany('business'),
  profileImage: belongsTo('profileImage'),

  profileStatus: computed({
    get() {
      let hasProfile = get(this, 'hasProfile');
      if(hasProfile && get(this, 'isPublic')) {
        return 'Public';
      } else if (hasProfile) {
        return 'Private';
      } else {
        return 'None';
      }
    }
  })
});