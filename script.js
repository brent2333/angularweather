var app = angular.module("weatherApp", ['ngAutocomplete']);
app.config(['$httpProvider',
    function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

angular.element('#noData');

app.factory('Data', function($rootScope) {

    if (localStorage["fav"]) 
        { var loc = localStorage["fav"]; } 
    else {
       var loc = ''; 
    }
    var cond = '';
    var units = 'imperial';

    return {
        loc: loc,
        cond: cond,
        units: units
    };
});

app.controller("locSearch", function($scope, Data, $rootScope) {
    var selection = '';
    $scope.result1 = '';
    $scope.options1 = {
        types: '(cities)'
    };
    $scope.details1 = '';
    $scope.data = Data;
    $scope.$watch('details1', function() {
        if($scope.details1.formatted_address){
        selection = $scope.details1.formatted_address.split(',');
        selection = selection[0];
        $scope.data.loc = selection;
        $rootScope.$broadcast('selection');
    }
    });
    jQuery('#showFav').on('click', function(e){
        e.preventDefault();
        if (localStorage["fav"]) {
            $scope.data.loc = localStorage["fav"];
            $rootScope.$broadcast('favorite');
        } else {
            console.log('no favorite');
        }
    })


});

app.controller("currentConditions", function($scope, $http, Data, $rootScope) {
    $scope.flagApi = false;

    function getCurr(item, event) {
        $scope.data = Data;
        var loc = $scope.data.loc;
        var units = $scope.data.units;
        $scope.showDetails = true;
        var config = {
            method: "get",
            url: "http://api.openweathermap.org/data/2.5/weather?q=" + loc + "&units=" + units + "APPID=6fc54f7a8da9cbe3f68a6ca10d94fb3d",
            cache: true

        }
        var responsePromise = $http(config);

        responsePromise.success(function(data, status, headers, config) {
            $scope.desc = data.weather[0].description;
            $scope.name = data.name.toUpperCase();
            $scope.temp = data.main.temp;
            $scope.humid = data.main.humidity;
            $scope.wind = data.wind.speed;
            $scope.data.cond = data.weather[0].main;
            // console.log('data cond '+ $scope.data.cond);
            $rootScope.$broadcast('databack');

            jQuery('#five-day').slideDown();
            jQuery('.noData').css('height', '0');
            if (units == 'imperial') {
                jQuery('#main-temp-unit').empty().prepend('&#176; F');
            } else {
                jQuery('#main-temp-unit').empty().prepend('&#176; C');
                }
            jQuery('#loader').fadeOut();
            jQuery('#intro').remove();

        });
        responsePromise.error(function(data, status, headers, config) {
            // console.log(status);
            document.write('bad ajax call');
            jQuery('.noData').show();
        });
    }

    $rootScope.$on('selection', function(event, args) {
        getCurr();
        jQuery('#noData').hide();
        jQuery('#currentConditions').prepend('<div id="loader"><img src="images/ajax-loader.gif"></div>');
    });
    $rootScope.$on('unitchange', function(event, args) {
        getCurr();
    });
    $rootScope.$on('favorite', function(event, args) {
        getCurr();
    });


});
app.controller("5dayForecast", function($scope, $http, Data, $rootScope){
        $scope.fiveShow = false;
        function getFore(item, event) {
        $scope.data = Data;
        var loc = $scope.data.loc;
        var units = $scope.data.units;
        var config = {
            method: "get",
            url: "http://api.openweathermap.org/data/2.5/forecast/daily?q=" + loc + '&units=' + units+"&cnt=7" + "APPID=6fc54f7a8da9cbe3f68a6ca10d94fb3d",
            cache: true

        }
        var foreResponsePromise = $http(config);

        foreResponsePromise.success(function(data, status, headers, config) {
            

            $scope.list = data.list;
            $scope.fiveShow = true;
            $scope.showDetails = true;


        });
        foreResponsePromise.error(function(data, status, headers, config) {
            // document.write('bad ajax call');
            jQuery('.noData').show();
        });
    }

    $rootScope.$on('selection', function(event, args) {
        getFore();
    });
    $rootScope.$on('unitchange', function(event, args) {
        getFore();
    });
    $rootScope.$on('favorite', function(event, args) {
        getFore();
    });
});
app.controller("global", function($scope, $http, Data, $rootScope){
        function getConfig(item, event) {
        $scope.data = Data;
        $scope.unitChange = function() {
            var units = $scope.units;
            $scope.data.units = units;
            $rootScope.$broadcast('unitchange');
        }

        $scope.cond = $scope.data.cond;
        if ($scope.cond == 'Rain') {
            jQuery('body').removeClass('clear').removeClass('clouds').removeClass('thunderstorm').addClass('rain');}
        if ($scope.cond == 'Clear') {
            jQuery('body').removeClass('rain').removeClass('clouds').removeClass('thunderstorm').addClass('clear');}
        if ($scope.cond == 'Clouds') {
            jQuery('body').removeClass('clear').removeClass('rain').removeClass('thunderstorm').addClass('clouds');}
        if ($scope.cond == 'Thunderstorm') {
            jQuery('body').removeClass('clear').removeClass('clouds').removeClass('rain').addClass('thunderstorm');}
        if ($scope.cond == 'Mist') {
            jQuery('body').removeClass('clear').removeClass('clouds').removeClass('rain').addClass('mist');}
        if ($scope.cond == 'Haze') {
            jQuery('body').removeClass('clear').removeClass('clouds').removeClass('rain').addClass('mist');}

    }

    $rootScope.$on('databack', function(event, args) {
        getConfig();
    });
});