// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'uiGmapgoogle-maps', 'ngCordova', 'google.places',
  'angularFileUpload'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.20', //defaults to latest 3.X anyhow
      libraries: 'weather,geometry,visualization'
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('user', {
        url: '/user',
        abstract: true,
        templateUrl: 'templates/user.html',
        controller: 'UserCtrl'
      })

      .state('user.login', {
        url: '/login',
        views: {
          'userContent': {
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl'
          }
        }
      })

      .state('user.register', {
        url: '/register',
        views: {
          'userContent': {
            templateUrl: 'templates/register.html',
            controller: 'RegisterCtrl'
          }
        }
      })

      .state('user.reset', {
        url: '/reset',
        views: {
          'userContent': {
            templateUrl: 'templates/reset.html',
            controller: 'ResetCtrl'
          }
        }
      })

      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
      })

      .state('app.home', {
        url: '/home',
        views: {
          'menuContent': {
            templateUrl: 'templates/home.html',
            controller: 'HomeCtrl'
          }
        }
      })

      .state('app.categories', {
        url: '/categories?:categoryId',
        views: {
          'menuContent': {
            templateUrl: 'templates/categories.html',
            controller: 'CategoryCtrl'
          }
        }
      })

      .state('app.listings', {
        url: '/listings/:listingTypeId',
        views: {
          'menuContent': {
            templateUrl: 'templates/listings.html',
            controller: 'ListingsCtrl'
          }
        }
      })

      .state('app.listing', {
        url: '/listing/:listingId',
        views: {
          'menuContent': {
            templateUrl: 'templates/listing.html',
            controller: 'ListingCtrl'
          }
        }
      })

      .state('app.location', {
        url: '/location?lat&lon',
        views: {
          'menuContent': {
            templateUrl: 'templates/location_map.html',
            controller: 'MapCtrl'
          }
        }
      })

      .state('app.profile', {
        url: '/userprofile',
        views: {
          'menuContent': {
            templateUrl: 'templates/user_profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })

      .state('app.submitBusiness', {
        url: '/submitbusiness',
        views: {
          'menuContent': {
            templateUrl: 'templates/user_submit_business.html',
            controller: 'SubmitBusinessCtrl'
          }
        }
      })

      .state('app.updateBusiness', {
        url: '/updateBusiness/{params*}',
        params: {
          id: null,
          title: null,
          description: null,
          contactNumber: null,
          address: null,
          whatsAppNumber: null,
          coordinates: null
        },
        views: {
          'menuContent': {
            templateUrl: 'templates/user_submit_business.html',
            controller: 'SubmitBusinessCtrl'
          }
        }
      })

      .state('app.userListings', {
        url: '/userlistings',
        views: {
          'menuContent': {
            templateUrl: 'templates/user_listings.html',
            controller: 'UserListingCtrl'
          }
        }
      })

      .state('app.userFavourites', {
          url: '/userfavourites',
          views: {
            'menuContent': {
              templateUrl: 'templates/user_favs.html'
            }
          }
      })

      .state('app.userSearchHistory', {
        url: '/searchhistory',
        views: {
          'menuContent': {
            templateUrl: 'templates/user_search_history.html'
          }
        }
      })

      .state('app.userRecommendations', {
        url: '/recommendations',
        views: {
          'menuContent': {
            templateUrl: 'templates/user_recommendations.html',
            controller: 'RecommendationCtrl'
          }
        }
      })



    ;
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/home');
  });
