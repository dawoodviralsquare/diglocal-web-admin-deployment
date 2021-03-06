import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('login');

  this.route('authenticated', { path: '/' }, function() {
    this.route('region', { path: 'region/:region_id' }, function() {
      this.route('analytics', function() {
        this.route('index', { path: '/' });
      });
      this.route('site-settings', { path: 'settings' }, function() {
        this.route('index', { path: '/' });
        this.route('categories', function() {
          this.route('index', { path: '/' });
          this.route('new');
          this.route('view', { path: ':category_id' });
        });
      });
      this.route('site-stats', function() {
        this.route('index', { path: '/' });
      });
      this.route('businesses', function() {
        this.route('view', { path: ':business_id' }, function() {
          this.route('locations');
          this.route('photos');
          this.route('homes', function() {
            this.route('index', { path: '/' });
            this.route('view', { path: ':home_id' });
            this.route('new');
          });
          this.route('scoops', function() {
            this.route('index', { path: '/' });
            this.route('view', { path: ':scoop_id' });
            this.route('new');
          });
          this.route('users');
        });
        this.route('new');
      });
      this.route('users', function() {
        this.route('view', { path: ':user_id' });
      });
      this.route('scoops', function() {
        this.route('view', { path: ':scoop_id' });
        this.route('new');
      });
      this.route('homes', function() {
        this.route('view', { path: ':home_id' });
        this.route('new');
      });
      this.route('lists', function() {
        this.route('index', { path: '/' });
        this.route('view', { path: ':list_id' });
      });
      this.route('newsletters', function() {
        this.route('index', { path: '/' });
      });
    });

    this.route('select-region');
    this.route('new-region');
    this.route('manage', function() {
      this.route('business', { path: 'business/:manage_business_id' }, function() {
        this.route('scoops', function() {
          this.route('index', { path: '/' })
          this.route('view', { path: '/:manage_scoop_id'});
          this.route('new');
        });
        this.route('users');
        this.route('photos');
        this.route('locations');
        this.route('homes', function() {
          this.route('index', { path: '/' });
          this.route('view', { path: '/:manage_home_id'});
          this.route('new');
        });
      });
      this.route('select-business');
    });
    this.route('select-business');
  });

  this.route('404', { path: '/*' });

  this.route('manage', function() {});
});
