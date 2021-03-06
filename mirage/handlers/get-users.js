import { Collection } from 'ember-cli-mirage';
import { camelize } from '@ember/string';
import config from 'diglocal-manage/config/environment';

const filterUsers = function(users, request) {
  let filters = [];
  let sort = request.queryParams['sort'];
  let search =  request.queryParams['filter[search]'];
  let roles = request.queryParams['filter[roles]'];
  let firebaseId = request.queryParams['filter[firebaseId]'];

  if (firebaseId) {
    if (config.environment === 'test') {
      filters.push(user => user.firebaseId === firebaseId);
    } else {
      /***
      * BELOW CODE IS JUST FOR MIRAGE DEV ENVIRONMENT
      * TO MOCK THE FIREBASE CURRENT USER RESPONSE
      ***/
      /* uncomment below to login as an admin user */
      // filters.push(user => user.admin);

      /* uncomment below to login as a multi-region, multi-business owner */
      // filters.push(user => user.id === '2222');

      /* uncomment below to login as a single-region, multi-business owner */
      filters.push(user => user.id === '3333');

      /* uncomment below to login as a single business owner */
      // filters.push(user => user.id === '4444');

      /* uncomment below to login as a regular user (restricted) */
      // filters.push(user => !user.businesses.length);
    }
  }

  if (search) {
    filters.push((user) => {
      let values = [
        user.givenName,
        user.surname,
        user.publicName,
        user.email,
        user.user
      ];
      return values.any(val => val.match(search));
    });
  }

  if (roles) {
    filters.push(user => user.role && roles.includes(user.role));
  }

  let results = filters
    .reduce(((results, filter) => results.filter(filter)), users);

  if (sort) {
    let isDescending = sort.startsWith('-');
    if (isDescending) {
      results = results.sortBy(camelize(sort.slice(1))).reverse();
    } else {
      results = results.sortBy(camelize(sort));
    }
  }

  return results;
};

export default function getUsers(schema, request) {
  let users = schema.users.all().models;

  let offset = request.queryParams['page[offset]'];
  let limit = request.queryParams['page[limit]'];

  let results = new Collection(
    'user',
    filterUsers(users, request)
  );

  let total = results.length;

  if (offset && limit) {
    offset = Number.parseInt(offset);
    limit = Number.parseInt(limit);

    let end = offset + limit;
    results = results.slice(offset, end);
  }

  results.meta = {
    total
  };

  return results;
}
