var angularApp = angular.module('suTour', ['ngRoute', 'ngSanitize','ngOrderObjectBy']);
var lang = window.navigator.language || window.navigator.userLanguage;

if ($.cookie('sutourLang')) {
	lang = $.cookie('sutourLang');
} else {
	$.cookie('sutourLang', lang, {
		expires: 30,
		path: '/'
	});
}

angularApp.controller('suTourController', function ($scope, $http) {

	if (lang.toLowerCase() == 'tr' || lang.toLowerCase() == 'tr-us' || lang.toLowerCase() == 'tr-tr') {
		lang = 'tr';
	} else {
		lang = 'en';
	}

	//$http.get(lang + ".json").then(function (response) {
	$http.get("http://tercihim.sabanciuniv.edu/" + (lang == 'tr' ? '/' : lang + '/') + "json/v1/sumap").then(function successCallback(response) {

		data = {};

		angular.forEach(response.data, function (value, key) {
			data[value.nid] = value;
		});

		console.log(data);

		$scope.myData = data;
		$scope.lang = lang;

		// TR problem varsa cevirim yapiniz...
		// https://www.unicodetools.com/unicode/convert-to-html.php

		$scope.labelSearch = lang == 'tr' ? 'Arama' : 'Search';
		$scope.labelNoResults = lang == 'tr' ? 'Kayıt yok...' : 'No results found...';
		$scope.labelAzBookmarks = lang == 'tr' ? 'A-Z Yer İmleri' : 'A-Z Bookmarks';
		$scope.labelClickForDetail = lang == 'tr' ? 'Detay için tıklayınız' : 'Click for detail';

		// stackoverflow.com/questions/14788652/how-to-filter-key-value-with-ng-repeat-in-angularjs
		$scope.filterSearch = function (items) {
			var result = {};
			var searchText = document.getElementById('keyword').value;
			searchText = searchText.toLowerCase();
			angular.forEach(items, function (value, key) {
				if (value.title.toLowerCase().indexOf(searchText) >= 0) {
					result[key] = value;
				}
			});
			if (Object.keys(result).length == 0) {
				result = null;
			}
			return result;
		}

		/*$scope.temizle = function () {
			//$scope.keyword = '';
		}*/
	}, function errorCallback(response) {

		$scope.myData = null;

		if (navigator.notification) {
			navigator.notification.alert(
				lang == 'tr' ? 'Internet bağlantısı çevrimdışı gözüküyor.' : 'The Internet connection appears to be offline.', // message
				function () {}, // callback
				lang == 'tr' ? 'Uyarı' : 'Warning', // title
				lang == 'tr' ? 'Tamam' : 'OK' // button name
			);
			$('body .list ul').append('<li class="_refresh"><a href="javascript:location.reload();$(this).remove();">'+ (lang == 'tr' ? 'Yenilemek için tıklayınız' : 'Click for refresh') +'</a></li>');
		} else {
			$('html').addClass('nointernet');
		}
	});
});

angularApp.controller('listCtrl', function ($scope, $routeParams, $location, $http) {
	$('html').attr('ng-view', 'list');

	var idParam = $routeParams.id;

	// console.log("id", idParam);

	$scope.title = $scope.myData[idParam].title;
	$scope.body = $scope.myData[idParam].body;

	if (window.ga) window.ga.trackEvent('View', 'List', $scope.title, "");

	if (map) {
		map.clear();
		map.off();
		map.trigger("test");
	}
});

angularApp.controller('mapCtrl', function ($scope, $routeParams, $location, $http) {
	$('html').attr('ng-view', 'map');

	var idParam = $routeParams.id;

	// console.log("id", idParam);

	$scope.key = idParam;
	$scope.title = $scope.myData[idParam].title;
	$scope.lat = $scope.myData[idParam].lat;
	$scope.lng = $scope.myData[idParam].lng;

	if (window.ga) window.ga.trackEvent('View', 'Map', $scope.title, "");

	if (map) {
		map.clear();
		map.off();
		map.trigger("test");
	}

	googleMap($scope.myData[idParam].lat, $scope.myData[idParam].lng);
});

angularApp.controller('detailCtrl', function ($scope, $routeParams, $location, $http) {
	$('html').attr('ng-view', 'detail');

	var idParam = $routeParams.id;

	// console.log("id", idParam);

	$scope.title = $scope.myData[idParam].title;
	$scope.body = $scope.myData[idParam].body;
	$scope.lat = $scope.myData[idParam].lat;
	$scope.lng = $scope.myData[idParam].lng;

	if (window.ga) window.ga.trackEvent('View', 'Detail', $scope.title, "");

	if (map) {
		map.clear();
		map.off();
		map.trigger("test");
	}

	$('.description').on('click', 'a.goNavigation', function (event) {
		event.preventDefault();

		const GOOGLE = new plugin.google.maps.LatLng($scope.lat, $scope.lng);

		if (!mapMyLocation) {
			navigator.notification.alert(
				lang == 'tr' ? 'Bu uygulamanın konum servisini kullanmasına izin veriniz.' : 'Allow this application to use location services.', // message
				function () {}, // callback
				lang == 'tr' ? 'Uyarı' : 'Warning', // title
				lang == 'tr' ? 'Tamam' : 'OK' // button name
			);
		} else {

			if (window.ga) window.ga.trackEvent('Click', 'Detail', 'Go Navigation', "");

			plugin.google.maps.external.launchNavigation({
				"from": mapMyLocation,
				"to": $scope.lat + ',' + $scope.lng
			});
		}
	});
});

angularApp.controller('azCtrl', function ($scope, $routeParams, $location, $http) {
	$('html').attr('ng-view', 'az');

	if (window.ga) window.ga.trackView('A-Z Bookmarks');
});

angularApp.controller('mainCtrl', function ($scope, $routeParams, $location, $http) {
	$('html').attr('ng-view', 'main');

	if (window.ga) window.ga.trackView('Home');

	$scope.setLang = function (str) {
		$('.lang a').removeClass('active');
		$('.lang a._' + str).addClass('active');
		lang = str;
		if (window.ga) window.ga.trackEvent('Click', 'Language', lang, "");
		$.cookie('sutourLang', str, {
			expires: 30,
			path: '/'
		});
		location.reload();
	};
});

angularApp.config(function ($routeProvider) {
	$routeProvider
		.when("/", {
			templateUrl: "main.html",
			controller: "mainCtrl"
		})
		.when("/az", {
			templateUrl: "az.html",
			controller: "azCtrl"
		})
		.when("/detail/:id", {
			templateUrl: "detail.html",
			controller: 'detailCtrl'
		})
		.when("/list/:id", {
			templateUrl: "list.html",
			controller: 'listCtrl'
		})
		.when("/map/:id", {
			templateUrl: "map.html",
			controller: 'mapCtrl'
		})
		.otherwise({
			redirectTo: '/',
			controller: "homeCtrl"
		});
});
