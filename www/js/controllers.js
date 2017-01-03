angular.module('ionic.utils', [])
  .factory('$localStorage', ['$window', function($window){
    return {
      set: function(key, value) {
        $window.localStorage[key] = value;
      },
      get: function(key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
      },
      setObject: function(key, value) {
        $window.localStorage[key] = JSON.stringify(value);
      },
      getObject: function(key) {
        return JSON.parse($window.localStorage[key] || '{}');
      },
      deleteObject: function(key) {
        delete $window.localStorage[key]
      }
    }
  }])

  .factory('$toast', ['$ionicLoading', function($ionicLoading){
    return {
      show:  function(message, duration) {
        $ionicLoading.show({
        template: message,
        noBackdrop: true,
        duration: duration
        })
      }
    }
  }]);


angular.module('starter.controllers', ['ionic.utils'])

  .run(function($rootScope, $localStorage){
    $rootScope.user = $localStorage.getObject('user');
    $rootScope.cookie = $localStorage.getObject('cookie');
    $rootScope.favourites = $localStorage.getObject('favourites');
    $rootScope.searchHistory = $localStorage.getObject('searchHistory');
    $rootScope.defaultLocation = $localStorage.getObject('defaultLocation');
  })


  .controller('AppCtrl', function($scope, $rootScope, $state) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});
    $scope.$watch('$viewContentLoading', function(event, viewConfig) {

      if (Object.keys($rootScope.user).length == 0) {
        $state.go('user.login');
      }

    });


  })

  .filter('formatString', function() {
    return function(input) {
      return (input.replace("&amp;", "&"));
    };
  })

  .controller('UserCtrl', function($scope, $stateParams) {
  })

  .controller('LoginCtrl', function($scope, $stateParams, $state, $http, $toast, $ionicLoading, $rootScope, $localStorage) {

    $scope.credentials = {'username': '', 'password': ''};

    $scope.credentials.nonce = '';

    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/get_nonce/?controller=user&method=register',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      if (data.status != "error") {
        $scope.credentials.nonce = data.nonce;
      }

      else {
        $toast.show("Unable to get nonce value", 2000);
      }


    }).error(function (data, status, headers, config) {
      $toast.show('Please try again later', 2000);
    });
    $scope.login = function() {

      $ionicLoading.show({
        template: '<ion-spinner class="spinner-energized"></ion-spinner>',
        noBackdrop: true
      });

      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/user/Login/',
        headers: {'Content-Type': 'application/json'},
        params: $scope.credentials
      }).success(function (data, status, headers, config) {
        $ionicLoading.hide();
        if (data.status != "error") {
          $localStorage.setObject('user', data.user);
          $localStorage.setObject('cookie', {value :data.cookie_name, full: data.cookie});
          $rootScope.user = $localStorage.getObject('user');
          $rootScope.cookie = $localStorage.getObject('cookie');
          $toast.show('Click the button to change your location'
            + '<button class="col col-25 col-offset-33" id="location-switch">' +
          '<div><i class="ion-android-pin"> </i>Patan</div></button>', 3000);
          $state.transitionTo('app.home');
        }

        else {
          $toast.show("Invalid Username/Password", 2000);
        }

      }).error(function (data, status, headers, config) {
        $ionicLoading.hide();
        $toast.show('Unable to Connect', 2000);
      });

    };

    $scope.goToRegister = function() {
     $state.transitionTo('user.register');
    }

  })

  .controller('LogoutCtrl', function($rootScope, $scope, $state, $localStorage) {
    $scope.logout = function() {
      $rootScope.user = {};
      $rootScope.cookie = {};
      $localStorage.deleteObject('user');
      $localStorage.deleteObject('cookie');
      $state.transitionTo('user.login');
    }
  })

  .controller('RegisterCtrl', function($scope, $stateParams, $state, $http, $ionicLoading, $toast) {

    $scope.credentials = {username: '', email: '', nonce: ''};


    $scope.register = function() {

      $ionicLoading.show({
        template: '<ion-spinner class="spinner-energized"></ion-spinner>',
        noBackdrop: true
      });

      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/user/register/',
        headers: {'Content-Type': 'application/json'},
        params: $scope.credentials
      }).success(function (data, status, headers, config) {
        $ionicLoading.hide();
        if (data.status != "error") {
          $toast.show("Your password has been sent to the registered mobile number", 3500);
          $state.transitionTo('user.login');
        }

        else {
          $toast.show(data.error, 2000);
        }

      }).error(function (data, status, headers, config) {
        $ionicLoading.hide();
        $toast.show(data.error, 2000);
      });

    };

  })

  .controller('ResetCtrl', function($scope, $state, $ionicLoading, $http, $toast) {
    $scope.credentials = {username: ''};
    $scope.resetPassword = function() {

      $ionicLoading.show({
        template: '<ion-spinner class="spinner-energized"></ion-spinner>',
        noBackdrop: true
      });

      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/user/resetPassword/',
        headers: {'Content-Type': 'application/json'},
        params: {username: $scope.credentials.username}
      }).success(function (data, status, headers, config) {
        $ionicLoading.hide();
        if (data.status != "error") {
          $toast.show('Your password has been reset successfully', 3500);
          $state.transitionTo('user.login');
        }

        else {
          $toast.show(data.error, 2000);
        }

      }).error(function (data, status, headers, config) {
        $ionicLoading.hide();
        $toast.show(data.error, 2000);
      });

    }
  })

  .controller('HomeCtrl', function($scope, $state, $rootScope, $http, $ionicLoading, $localStorage) {

    $rootScope.directory = $localStorage.getObject('directory');

    if (Object.keys($rootScope.directory).length == 0) {

      $ionicLoading.show({
        template: '<ion-spinner class="spinner-energized"></ion-spinner>',
        noBackdrop: true
      });

      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/pf/getdirectorylist/',
        headers: {'Content-Type': 'application/json'}
      }).success(function (data, status, headers, config) {
        delete(data.status);
        $rootScope.directory = [];

        var count = parseInt(Object.keys(data).length/3);

        for (var i=0; i<count; i++) {
          console.log($rootScope.directory);
          $rootScope.directory.push([]);
          for (var j=0; j<=2; j++) {
            $rootScope.directory[i].push({
              id: data[i*3 + j].id,
              iconimage: data[i*3 + j].iconimage[0],
              name: data[i*3 + j].name
            });
          }
        }
        $localStorage.setObject('directory', $rootScope.directory);
        $ionicLoading.hide();

      }).error(function (data, status, headers, config) {
        $scope.resetFields();
        $ionicLoading.hide();
        $toast.show('Unable to Connect', 2000);
      });
    };


    $scope.displaySubCategories =  function(id) {
      $state.transitionTo('app.categories', {categoryId: id})
    }

  })

  .controller('ProfileCtrl', function($scope, $state, $http, $rootScope, $toast, $ionicLoading, $localStorage) {
    $scope.userDetails = {
      fullName: $rootScope.user.firstname + " " + $rootScope.user.lastname,  //map to first_name and last_name
      email: $rootScope.user.email, // map to email
      address: $rootScope.user.description, // map to description
      password: '', // map to user_pass
      repeatPassword: '' // no mapping
    };
    console.log($scope.userDetails);

    $scope.validatePassword = function() {
      if ($scope.userDetails.password == $scope.userDetails.repeatPassword) {
        return true;
      }
      else {
        $toast.show("Passwords do not match", 2000);
        return false;
      }

    };

    $scope.validateFields = function() {
      if ($scope.validatePassword()) {
        if ($scope.userDetails.fullName.split(' ').length < 2 || $scope.userDetails.fullName.match(" ") != ' ') {
          $toast.show('Enter full name separated by a space', 2000);
          return false;
        }

        else {
          return true;
        }

      }
      else {
        return false
      }
    };

    $scope.resetFields = function() {
      $scope.userDetails.password = '';
      $scope.userDetails.repeatPassword = '';
    };

    $scope.updateProfile = function() {



      if ($scope.validateFields()) {

        var params = {
          cookie: $rootScope.cookie.full,
          ID: $rootScope.user.id,
          first_name: $scope.userDetails.fullName.split(' ')[0],
          last_name: $scope.userDetails.fullName.split(' ')[1],
          description: $scope.userDetails.address
        };

        if ($scope.userDetails.password != '') {
          params.user_pass = $scope.userDetails.password;
        }

        $ionicLoading.show({
          template: '<ion-spinner class="spinner-energized"></ion-spinner>',
          noBackdrop: true
        });
        $http({
          method: 'GET',
          url: 'http://emaitr.com/api/user/updateUserProfile/',
          headers: {'Content-Type': 'application/json'},
          params: params
        }).success(function (data, status, headers, config) {
          $rootScope.user.firstname = $scope.userDetails.fullName.split(' ')[0];
          $rootScope.user.lastname = $scope.userDetails.fullName.split(' ')[1];
          $rootScope.user.description = $scope.userDetails.address;
          $rootScope.user.email = $scope.userDetails.email;
          $localStorage.setObject('user', $rootScope.user);
          $scope.resetFields();
          $ionicLoading.hide();
          $toast.show('Your profile has been updated', 2000);

        }).error(function (data, status, headers, config) {
          $scope.resetFields();
          $ionicLoading.hide();
          $toast.show('Unable to Connect', 2000);
        });


      }

    }

  })

  .controller('CategoryCtrl', function($scope, $stateParams, $http, $ionicLoading, $state, $toast) {
    $scope.categoryId = $stateParams.categoryId;
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-energized"></ion-spinner>',
      noBackdrop: true
    });
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getdirectorylist/',
      headers: {'Content-Type': 'application/json'},
      params: {id: $scope.categoryId}
    }).success(function (data, status, headers, config) {
      $ionicLoading.hide();
      $scope.categoryName = data[0].name.replace("&amp;", "&");
      $scope.subCategories = data[0].child;

    }).error(function (data, status, headers, config) {
      $ionicLoading.hide();
      $toast.show('Unable to Connect', 2000);
    });

  })

  .controller('ListingsCtrl', function($scope, $stateParams, $http, $ionicLoading, $state, $rootScope) {
    $scope.message = 'No Listings Found Under this Category';
    $scope.noResultsFlag = false;
    $scope.listingTypeId = $stateParams.listingTypeId;
    $scope.listings = {};
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-energized"></ion-spinner>',
      noBackdrop: true
    });
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getlisting/',
      headers: {'Content-Type': 'application/json'},
      params: {listingtype: $scope.listingTypeId, locationtype: $rootScope.defaultLocation.id, limit: 200}
    }).success(function (data, status, headers, config) {
      $ionicLoading.hide();
      $scope.listings = data.data;
      if (Object.keys($scope.listings).length == 0) {
        $scope.noResultsFlag = true;
      }

    }).error(function (data, status, headers, config) {
      $ionicLoading.hide();
      $toast.show('Unable to Connect', 2000);
    });


  })

  .controller('ListingCtrl', function($scope, $stateParams, $http, $ionicLoading, $state, $toast, $rootScope,$interval) {
    $scope.isOwnListing = false;



    $scope.businessHours = [
      {day:'Monday', timings: 'Closed'},
      {day:'Tuesday', timings: 'Closed'},
      {day:'Wednesday', timings: 'Closed'},
      {day:'Thursday', timings: 'Closed'},
      {day:'Friday', timings: 'Closed'},
      {day:'Saturday', timings: 'Closed'},
      {day:'Sunday', timings: 'Closed'}
    ];

    $scope.recommendations = 0;
    var nonce = '';
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/get_nonce/?controller=posts&method=create_post',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      if (data.status != "error") {
        nonce = data.nonce;

      }

      else {
        $toast.show("Unable to get nonce value", 2000);
      }


    }).error(function (data, status, headers, config) {
      $toast.show('Please try again later', 2000);
    });

    $scope.getListingRecommendations = function(id) {
      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/pf/getrecommendations/',
        headers: {'Content-Type': 'application/json'},
        params: {pid: id}
      }).success(function(data, status, headers, config) {

        if (data.count != null) {
          $scope.recommendations = data.count;

        }


      }).error(function(data, status, headers, config) {
        $toast.show(data.error, 2000)
      });
    };

    $scope.recommend = function(id) {

      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/pf/setrecommendations/',
        headers: {'Content-Type': 'application/json'},
        params: {postid: id, nonce: nonce, userid: $rootScope.user.id}
      }).success(function(data, status, headers, config) {
        $scope.recommendations = data.count;

        $toast.show(data.message, 2000)


      }).error(function(data, status, headers, config) {
        $toast.show(data.error, 2000)
      });

    };

    $scope.tabs = {description: true, offers: false, businessHours: false};
    $scope.tabSwitch = function(tabType) {
      $scope.tabs.description = false;
      $scope.tabs.offers = false;
      $scope.tabs.businessHours = false;
      $scope.tabs[tabType] = true;
    };


    $scope.listingId = $stateParams.listingId;
    $scope.customFields = {
      businessContactNum: ''
    };

    $scope.getListingRecommendations($scope.listingId);
    $scope.listing = {};
    $scope.imageGallery = [];

    $scope.editListing = function() {

      $state.go('app.updateBusiness',
        {
          id: $scope.listing.id,
          title: $scope.listing.title,
          description: $scope.listing.excerpt,
          contactNumber: $scope.customFields.businessContactNum,
          address: $scope.listing.address.address,
          whatsAppNumber: $scope.customFields.whatsappNum,
          coordinates: $scope.listing.address.coordinates
        });
    };

    var imageIndex = 0;



    $scope.prevImage = function() {

      if ($scope.imageGallery.length > 1) {

        if (imageIndex == 0) {
          imageIndex = $scope.imageGallery.length - 1;
        }

        else {
          imageIndex -= 1;
        }
        $scope.currentImage = $scope.imageGallery[imageIndex];
      }

    };



    $scope.nextImage = function() {

      if ($scope.imageGallery.length > 1) {

        if (imageIndex == $scope.imageGallery.length - 1) {
          imageIndex = 0;
        }

        else {
          imageIndex += 1;
        }
        $scope.currentImage = $scope.imageGallery[imageIndex];
      }

    };


    //$interval($scope.nextImage, 3000);

    $scope.currentImage = './img/empty_img.jpg';

    $ionicLoading.show({
      template: '<ion-spinner class="spinner-energized"></ion-spinner>',
      noBackdrop: true
    });
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getlisting/',
      headers: {'Content-Type': 'application/json'},
      params: {id: $scope.listingId, limit: 200}
    }).success(function (data, status, headers, config) {
      $ionicLoading.hide();
      $scope.listing = data.data[0];
      $scope.imageGallery = $scope.listing.images;
      $scope.currentImage = $scope.imageGallery[0];
      if ($scope.listing.authorid == $rootScope.user.id) {
        $scope.isOwnListing = true;
      }

      for (var index in $scope.listing.openingshours) {
        $scope.businessHours[index - 1].timings = $scope.listing.openingshours[index];
      }

      $scope.listing.attributes.forEach(function(element, index) {
        if (element.slug == "field462188025936484400000") {
          $scope.customFields.businessContactNum = element.value;
        }
        else if (element.slug == "field14592090621590614000") {
          $scope.customFields.whatsappNum = element.value;
        }
        else if (element.slug == "field148746094200760140000") {
          $scope.customFields.referralCode = element.value;
        }
      })


    }).error(function (data, status, headers, config) {
      $ionicLoading.hide();
      $toast.show('Unable to Connect', 2000);
    });

    $scope.loadListing = function(id) {
      $state.transitionTo('app.listing', {listingId: id})
    };

    $scope.loadMap = function(coords) {

      $state.transitionTo('app.location', {lat: coords.lat, lon: coords.lng});
    };

  })

.controller('MapCtrl', function($scope, $stateParams, uiGmapGoogleMapApi){

      $scope.map = { center: { latitude: $stateParams.lat, longitude: $stateParams.lon }, zoom: 15 };
      $scope.marker = { coords: { latitude: $stateParams.lat, longitude: $stateParams.lon }, id:1 };
      $scope.options = {scrollwheel: false};



  })

  .controller('SubmitBusinessCtrl', function($rootScope, $scope, $http, $toast, $ionicLoading, $state,
                                             FileUploader, $stateParams){

    var data = new FormData();

    $scope.imageCount = 0;
    $scope.onFileSet = function(files) {
      var f = files[0];
      var reader = new FileReader();
      reader.onload = (function(theFile) {
        return function(e) {
          var span = document.createElement('span');
          span.innerHTML = ['<img class="thumb" src="', e.target.result,
            '" title="', escape(theFile.name), '"/>'].join('');
          document.getElementById('thumbnails').insertBefore(span, null);
          console.log(span);
          data.append('images['+ $scope.imageCount +']', f);
          $scope.imageCount += 1;
          console.log(f);
        };
      })(f);
      reader.readAsDataURL(f);

    };



    $scope.business = {
      category: '',
      address: {formatted_address: null},
      subCategory: '',
      coordinates: {lat: 0, lng: 0},
      location: '',
      contactNumber: '',
      whatsappNumber: '',
      offers: '',
      referralCode: '',
      keywords: ''
    };


    if ($state.current.url != '/submitbusiness') {

      $scope.business = {
        title: $stateParams.title,
        description: $stateParams.description,
        address: $stateParams.address,
        coordinates: $stateParams.coordinates,
        location: $stateParams.location,
        contactNumber: $stateParams.contactNumber,
        whatsappNumber: $stateParams.whatsappNumber,
        offers: '',
        referralCode: '',
        keywords: ''
      };

    }



    $scope.getCoordinates = function(){

      if ($scope.business.address.geometry != undefined) {
        $scope.business.coordinates.lat = $scope.business.address.geometry.location.lat();
        $scope.business.coordinates.lng = $scope.business.address.geometry.location.lng();
      }

    };


    $scope.resetFields = function() {
      data = new FormData();
      $scope.imageCount = 0;
      var thumbnails = document.getElementById('thumbnails');
      thumbnails.innerHTML = "";
      $scope.business = {
        category: '',
        address: null,
        subCategory: '',
        coordinates: {lat: 0, lng: 0},
        location: '',
        contactNumber: '',
        whatsappNumber: '',
        offers: '',
        referralCode: '',
        keywords: ''
      };

      $scope.businessDays = [
        {day: 'M', status: false, hours: '-', fullDay: "Monday"},
        {day: 'T', status: false, hours: '-', fullDay: "Tuesday"},
        {day: 'W', status: false, hours: '-', fullDay: "Wednesday"},
        {day: 'T', status: false, hours: '-', fullDay: "Thursday"},
        {day: 'F', status: false, hours: '-', fullDay: "Friday"},
        {day: 'S', status: false, hours: '-', fullDay: "Saturday"},
        {day: 'S', status: false, hours: '-', fullDay: "Sunday"}
      ];

      $scope.businessHours = {opening: '', closing: ''};

    };

    $scope.timings = [];

    for (var i= 0; i<24; i++) {
      var hours = i > 9 ? "" + i: "0" + i;
      $scope.timings.push(hours+":00");
      $scope.timings.push(hours+":30");
    }

    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    function success(pos) {
      var crd = pos.coords; //TODO use this to bias the address search
      //$scope.business.coordinates.lat = crd.latitude;
      //$scope.business.coordinates.lon = crd.longitude;
    }

    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);

    $scope.locations={};
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getlocationlist/',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      delete(data.status);
      $scope.locations = data;
    }).error(function(data, status, headers, config) {
      $scope.locations = {};
    });

    $scope.businessDays = [
      {day: 'M', status: false, hours: '-', fullDay: "Monday"},
      {day: 'T', status: false, hours: '-', fullDay: "Tuesday"},
      {day: 'W', status: false, hours: '-', fullDay: "Wednesday"},
      {day: 'T', status: false, hours: '-', fullDay: "Thursday"},
      {day: 'F', status: false, hours: '-', fullDay: "Friday"},
      {day: 'S', status: false, hours: '-', fullDay: "Saturday"},
      {day: 'S', status: false, hours: '-', fullDay: "Sunday"}
    ];

    $scope.businessHours = {opening: '', closing: ''};

    $scope.checkHours = function(i) {
      if ($scope.businessHours.opening == '' || $scope.businessHours.closing == '') {
        $scope.businessDays[i].status = false;
        $toast.show("Select business hours", 2000);
      }
      else {
        $scope.businessDays[i].hours = $scope.businessHours.opening + '-' + $scope.businessHours.closing;
      }

    };

    $scope.categories = {};
    $scope.subCategories = {};
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getdirectorylist/',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      delete(data.status);
      $scope.categories = data;

    }).error(function(data, status, headers, config) {
      $scope.categories = {};
    });


    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getdirectorylist/',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      delete(data.status);
      $scope.categories = data;
    }).error(function(data, status, headers, config) {
      $scope.categories = {};
    });

    $scope.loadSubCategories = function() {
      $ionicLoading.show({
        template: '<ion-spinner class="spinner-energized"></ion-spinner>',
        noBackdrop: true
      });

      $http({
        method: 'GET',
        url: 'http://emaitr.com/api/pf/getdirectorylist/',
        headers: {'Content-Type': 'application/json'},
        params: {id: $scope.business.category}
      }).success(function(data, status, headers, config) {
        $ionicLoading.hide();
        delete(data.status);
        $scope.subCategories = data[0]['child'];
      }).error(function(data, status, headers, config) {
        $ionicLoading.hide();
        $scope.subCategories = {};
      });

    };

    var nonce = '';

    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/get_nonce/?controller=posts&method=create_post',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      if (data.status != "error") {
        nonce = data.nonce;

      }

      else {
        $toast.show("Unable to get nonce value", 2000);
      }


    }).error(function (data, status, headers, config) {
      $toast.show('Please try again later', 2000);
    });
    $scope.submitBusiness = function() {

      /*if($scope.uploader.getNotUploadedItems().length == 0) {
        $toast.show('Please select an image', 2000);
        return;
      }*/



      $ionicLoading.show({
        template: 'Your business will be live shortly after approval from eMaitr Admin',
        noBackdrop: true
      });

      if ($scope.business.title == '') {
        $toast.show('Enter business title', 2000);
        return;
      }

      if ($scope.business.description == '') {
        $toast.show('Enter business description', 2000);
        return;
      }

      if ($scope.business.address == '') {
        $toast.show('Enter address', 2000);
        return;
      }


      if ($scope.business.subCategory == '') {
        $toast.show('Enter sub category', 2000);
        return;
      }


      if ($scope.business.location == '') {
        $toast.show('Enter location', 2000);
        return;
      }

      if ($scope.business.contactNumber == '') {
        $toast.show('Enter contact number', 2000);
        return;
      }



      data.append('nonce', nonce);
      data.append('type', 'listing');
      data.append('title', $scope.business.title);
      data.append('content',$scope.business.description);
      data.append('author', $rootScope.user.nicename);
      data.append('cookie', $rootScope.cookie.value);
      data.append('status', 'publish');
      data.append('address', $scope.business.address.formatted_address);
      data.append('location', $scope.business.coordinates.lat+','+$scope.business.coordinates.lng);
      data.append('log', 2);
      data.append("terms[0][field]", 'pointfinderltypes');
      data.append("terms[0][value]",$scope.business.subCategory);
      data.append("terms[1][field]", 'pointfinderlocations');
      data.append("terms[1][value]", $scope.business.location);
      data.append("custom[0][field]", 'field462188025936484400000');
      data.append("custom[0][value]", $scope.business.contactNumber);
      data.append("custom[1][field]", 'field14592090621590614000');
      data.append("custom[1][value]", $scope.business.whatsappNumber);
      data.append("custom[2][field]", 'field148746094200760140000');
      data.append("custom[2][value]", $scope.business.referralCode);
      data.append("custom[3][field]", 'field735897602047771300000');
      data.append("custom[3][value]", $scope.business.keywords);

      if ($state.current.url != '/submitbusiness') {
        data.id = $stateParams.id;
      }

      for (var i=0; i<7; i++) {
        data["openinghours["+i+"][field]"] = i+1;
        data["openinghours["+i+"][value]"] = $scope.businessDays[i].hours;
      }

      $http({
        method: 'POST',
        url: 'http://emaitr.com/api/pf/submitlisting/',
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined},
        data: data
      }).success(function(data, status, headers, config) {
        var id = data.post['id'];
        $scope.resetFields();
        $ionicLoading.hide();
        $state.go('app.listing', {listingId: id});
      })
        .error(function(data, status, headers, config) {
          $ionicLoading.hide();
          $toast.show('Error Encountered, please try again later', 2000);
        });

    };

  })

.controller('UserListingCtrl', function($scope, $stateParams, $http, $rootScope, $ionicLoading) {
    $scope.userListings = [];
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-energized"></ion-spinner>',
      noBackdrop: true
    });
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getlisting/',
      headers: {'Content-Type': 'application/json'},
      params: {authorid: $rootScope.user.id, limit: 200}
    }).success(function (data, status, headers, config) {
      $ionicLoading.hide();
      $scope.userListings = data.data;


    }).error(function (data, status, headers, config) {
      $ionicLoading.hide();
      $toast.show('Unable to Connect', 2000);
    });
  })

.controller('UserFavouritesCtrl', function($scope, $rootScope, $localStorage, $toast) {
    $scope.addToFavourites = function(listing) {
      if (!$rootScope.favourites.hasOwnProperty(listing.id)) {
        $rootScope.favourites[listing.id] = listing;
        $localStorage.setObject('favourites', $rootScope.favourites);
        $toast.show("Added to favourites", 2000);
      }
      else {
        delete($rootScope.favourites[listing.id]);
        $localStorage.setObject('favourites', $rootScope.favourites);
        $toast.show("Removed from favourites", 2000);
      }
    }
  })

.controller('ShareCtrl', function($scope, $toast) {
    $scope.shareListing = function(listing) {
      window.plugins.socialsharing.share(listing.title, 'Shared via eMaitr - Your Search Buddy', null, listing.link)
    };

    $scope.sendMessage = function(listing) {
      window.plugins.socialsharing.shareViaEmail(
        'Message', // can contain HTML tags, but support on Android is rather limited:  http://stackoverflow.com/questions/15136480/how-to-send-html-content-with-image-through-android-default-email-client
        listing.title,
        ['info@emaitr.com'], // TO: must be null or an array
        null, // CC: must be null or an array
        null, // BCC: must be null or an array
        null, // FILES: can be null, a string, or an array
        function(){

        }, // called when sharing worked, but also when the user cancelled sharing via email (I've found no way to detect the difference)
        function(){
          $toast.show("Message could not be sent", 2000);
        } // called when sh*t hits the fan
      );

    }


  })

  .controller('RecommendationCtrl', function($scope, $http, $ionicLoading, $toast, $rootScope) {
    $scope.recommendations = [];
    $ionicLoading.show({
      template: '<ion-spinner class="spinner-energized"></ion-spinner>',
      noBackdrop: true
    });
    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getrecommendations/',
      headers: {'Content-Type': 'application/json'},
      params: {userid: $rootScope.user.id}
    }).success(function (data, status, headers, config) {
      $ionicLoading.hide();
      if (data.count>0) {
        $scope.recommendations = data.posts.data;
      }


    }).error(function (data, status, headers, config) {
      $ionicLoading.hide();
      $toast.show('Unable to Connect', 2000);
    });
  })

.controller('SearchCtrl', function($scope, $toast, $http, $state, $rootScope, $localStorage, $ionicPopover) {

    $ionicPopover.fromTemplateUrl('./templates/location_select.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $scope.search = {keyword: '', location: $rootScope.defaultLocation};

    $scope.selectLocation = function($event) {
      $scope.popover.show($event);
    };



    $scope.locations = {};
    $scope.results = [];

    $scope.getListing = function(listing) {
      $scope.search.keyword = '';
      $scope.results = [];
      $rootScope.searchHistory[listing.id] = listing;
      $localStorage.setObject('searchHistory',$rootScope.searchHistory);
      $state.transitionTo('app.listing', {listingId: listing.id})
    };



    $http({
      method: 'GET',
      url: 'http://emaitr.com/api/pf/getlocationlist/',
      headers: {'Content-Type': 'application/json'}
    }).success(function(data, status, headers, config) {
      delete(data.status);
      $scope.locations = data;
      if (Object.keys($rootScope.defaultLocation).length == 0) {
        $rootScope.defaultLocation = $scope.locations[0];
        $localStorage.setObject('defaultLocation', $rootScope.defaultLocation);
      }
    }).error(function(data, status, headers, config) {
      $scope.locations = {};
    });



    $scope.getListings = function(searchType) {
      $scope.popover.hide();
      $rootScope.defaultLocation = $scope.search.location;
      $localStorage.setObject('defaultLocation', $rootScope.defaultLocation);
      /*
      * searchType
      * 0 - When triggered by change in keyword
      * 1 - When triggered by change in location
      *
      * */

      if ($scope.search.keyword.length == 3 || (searchType==1 && $scope.search.keyword.length >= 3)) {
        $http({
          method: 'GET',
          url: 'http://emaitr.com/api/pf/getlisting/',
          headers: {'Content-Type': 'application/json'},
          params: {'search': $scope.search.keyword, 'locationtype': $scope.search.location.id, limit: 200}
        }).success(function(data, status, headers, config) {
          if ($scope.search.keyword.length >= 3) {
            $scope.results = data.data;
            $scope.results = data.data;

          }
        }).error(function(data, status, headers, config) {
          $scope.results = [];
        });
      }

      if ($scope.search.keyword.length == 0) {
        $scope.results = [];
      }

    };
  })

;
