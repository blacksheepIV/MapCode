/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function($scope,$mdSidenav,$log,$location){
    $scope.initVar = function(){
        $scope.isLoggedIn = false;
    }//end of initVar
    $scope.toggleRight= buildToggler('right');
    $scope.isOpenRight = function(){
        return $mdSidenav('right').isOpen();
    };
    function buildToggler(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    }
    //##################################################################################################################
    $scope.login=function(){
        $location.path("/login");
    };
    $scope.register=function(){
        $location.path("/registration");
    };
    $scope.logOut=function(){
        console.log("user just logged out.");
        //sth needed to distroy user's session/token,whatever
    }
    //******************************************************************************************************************
    var map = new google.maps.Map(document.getElementById('map'),{
            center:{lat:33.9870993,lng:51.4405203},
            zoom:10
        });
    var infoWindow = new google.maps.InfoWindow;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindow.setPosition(pos);
            infoWindow.setContent('شما اینجایید.');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}
}//end of main controller