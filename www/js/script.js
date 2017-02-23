var map;
var mapLat, mapLng;
var mapMyLocation;
var goTime;

var cordovaApp = {

	initialize: function () {
		this.bindEvents();
	},

	bindEvents: function () {
		document.addEventListener('deviceready', this.onDeviceReady, false);
	},

	onDeviceReady: function () {
		cordovaApp.receivedEvent('deviceready');
	},

	receivedEvent: function (info) {
		window.ga.startTrackerWithId('UA-83918054-1');
		$('html').attr('deviceready', true);

		if ($('html').hasClass('nointernet')) {
			navigator.notification.alert(
				lang == 'tr' ? 'Internet bağlantısı çevrimdışı gözüküyor.' : 'The Internet connection appears to be offline.', // message
				function () {}, // callback
				lang == 'tr' ? 'Uyarı' : 'Warning', // title
				lang == 'tr' ? 'Tamam' : 'OK' // button name
			);
			$('body .list ul').append('<li class="_refresh"><a href="javascript:location.reload();$(this).remove();">'+ (lang == 'tr' ? 'Yenilemek için tıklayınız' : 'Click for refresh') +'</a></li>');
		}
	}
};

cordovaApp.initialize();


$('body').on('touchstart', 'a:not(.noeffect)', function () {
	setTimeout("$('" + $(this).getPath() + "').addClass('touch');", 500);
}).on('touchend', 'a', function () {
	setTimeout("$('" + $(this).getPath() + "').removeClass('touch');", 500);
}).on('touchmove', 'a', function () {
	$(this).removeClass('touch');
});


if (navigator.userAgent.match(/Android/i)) {
	jQuery('html').addClass('android');
} else if ((navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i))) {
	jQuery('html').addClass('ios');
}


$('#keyword').focus(function () {
	$('body > div.search').addClass('focus');
}).keyup(function () {
	clearTimeout(goTime);
	goTime = setTimeout('goGA("' + this.value + '");', 500);
});

$('.keyword-search').click(function (e) {
	e.preventDefault();
	$('#keyword').focus();
	if (goTime) clearTimeout(goTime);
});

$('.keyword-close').click(function (e) {
	e.preventDefault();
	$('#keyword').val('').blur();
	$('body > div.search').removeClass('focus');
	if (goTime) clearTimeout(goTime);
});

$('.search form').submit(function () {
	goGA($('#keyword').val());
});


function goGA(word) {
	if (word.length > 1) {
		window.ga.trackEvent('Search', word, '', '');
		// console.log('cagrildi analiz');
	}
}


jQuery.fn.getPath = function () {
	if (this.length != 1) throw 'Requires one element.';

	var path, node = this;
	while (node.length) {
		var realNode = node[0],
			name = realNode.localName;
		if (!name) break;
		name = name.toLowerCase();

		var parent = node.parent();

		var siblings = parent.children(name);
		if (siblings.length > 1) {
			name += ':eq(' + siblings.index(realNode) + ')';
		}

		path = name + (path ? '>' + path : '');
		node = parent;
	}

	return path;
};


// Google Map
function googleMap(intLat, intLng) {

	//console.log('lat', intLat, 'lng', intLng, 'lang', lang);

	if (!$('html').attr('deviceready')) return;
	if (!document.getElementById("map_canvas")) return;

	lat = intLat;
	lng = intLng;

	const GOOGLE = new plugin.google.maps.LatLng(lat, lng);

	map = plugin.google.maps.Map.getMap(document.getElementById("map_canvas"), {
		'camera': {
			'latLng': GOOGLE,
			'zoom': 15.5
		}
	});

	map.addEventListener(plugin.google.maps.event.MAP_READY, googleMapReady);
}

function googleMapReady() {

	map.setMyLocationEnabled(true);
	map.getMyLocation(function (location) {
		mapMyLocation = location.latLng;
	});

	const GOOGLE = new plugin.google.maps.LatLng(lat, lng);

	map.addMarker({
		// 'draggable': true,
		// 'animation': plugin.google.maps.Animation.DROP,
		'position': GOOGLE,
		'title': $('#map_canvas').attr('data-name') + ' »',
		'snippet': $('#map_canvas').attr('data-clickfordetail'),
		'styles': {
			'text-align': 'center',
			'font-weight': 'bold',
			'color': '#F06D6D'
		}
	}, function (marker) {
		marker.showInfoWindow();
		/*marker.addEventListener(plugin.google.maps.event.MARKER_CLICK, function () {
			location.href = "#/detail/" + $('#map_canvas').attr('data-key');
		});*/
		marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function () {
			location.href = "#/detail/" + $('#map_canvas').attr('data-key');
		});

		// mapMarker.addEventListener(plugin.google.maps.event.MARKER_DRAG_END, function (marker) {
		//		mapMarker.getPosition(function (latLng) {
		//			console.log(latLng.toUrlValue());
		//		});
		//	});

		map.animateCamera({
			'target': {
				lat: lat,
				lng: lng
			},
			'duration': 500,
			'zoom': 15.5
		});
	});

	$('div.nav a.map-off').click(function () {
		map.setMapTypeId(plugin.google.maps.MapTypeId.ROADMAP);
		$('div.nav a.map-off').hide();
		$('div.nav a.map-on').show();
		window.ga.trackEvent('Click', 'Map', 'Road Map', "");
	});

	$('div.nav a.map-on').click(function () {
		map.setMapTypeId(plugin.google.maps.MapTypeId.SATELLITE);
		$('div.nav a.map-on').hide();
		$('div.nav a.map-off').show();
		window.ga.trackEvent('Click', 'Map', 'Satellite', "");
	});

}
