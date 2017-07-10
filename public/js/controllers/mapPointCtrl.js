/**
 * Created by blackSheep on 19-Jun-17.
 */
function mapPointCtrl($scope, $window, toastr, $timeout, $mdDialog, pointService) {
    $scope.initiation = function () {
        $scope.initMap();
        $timeout(
            function () {
                $scope.slowZoom(15, $scope.map.getZoom());
            }, 1000).then(
            function () {
                $scope.getApoint();
            }); 

    };//end of initiation function
    /* ########################################################################################################### */
    $scope.initMap = function () {
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 33.9870993, lng: 51.4405203},
            zoom: 10
        });
        google.maps.event.addDomListener($window, 'load', $scope.initMap);
        google.maps.event.trigger($scope.map, 'resize');
    }; //end of initMap
    /* ############################################################################################################# */
    $scope.slowZoom = function (maxZoom, currentZoom) {
        if (currentZoom >= maxZoom) {
            return;
        }
        else {
            google.maps.event.addListenerOnce($scope.map, 'zoom_changed', function (event) {
                // google.maps.event.removeListener(z);
                $scope.slowZoom($scope.map, maxZoom, currentZoom + 1);
            });
            setTimeout(function () {
                $scope.map.setZoom(currentZoom)
            }, 100);
        }

        /* if($scope.map.getZoom() < 15) {
         toastr.warning('روی نقشه بیشتر زوم کنید');
         $scope.map.addListener('zoom_changed', function () {
         console.log("user just zoomed the map in.");
         console.log($scope.map.getZoom());
         });
         } //end if condition
         if($scope.map.getZoom()>=15) {
         google.maps.event.addListener($scope.map, 'click', function (event) {
         placeMarker(event.latLng, $scope.showAdvanced);
         });

         function placeMarker(location, callback) {
         var marker = new google.maps.Marker({
         icon: '../img/Icons/1.png',
         position: location,
         map: $scope.map
         });
         // callback(location);
         var lat = location.lat();
         var lang = location.lng();
         pointService.setLocation(lat, lang);
         callback();
         }
         } */
    };//end of slowZoom
    //******************************************************************************************************************
    $scope.getApoint = function () {
        toastr.warning('روی هر نقطه ای از نقشه می خواهید کلیک کنید.', {closeButton: true});
        if (pointService.pointToBeSubmitted !== null) {
            if (pointService.pointToBeSubmitted.isPublic && !pointService.pointToBeSubmitted.isPersonal) {
                google.maps.event.addListener($scope.map, 'click', function (event) {
                    placeMarker(event.latLng, $scope.showAdvanced);
                });
                function placeMarker(location, callback) {
                    var marker = new google.maps.Marker({
                        icon: '../img/Icons/1.png',
                        position: location,
                        map: $scope.map
                    });
                    var lat = location.lat();
                    var lang = location.lng();
                    pointService.setLocation(lat, lang);
                    callback();
                };
            }//end of if condition
            if (!pointService.pointToBeSubmitted.isPublic && pointService.pointToBeSubmitted.isPersonal) {
                console.log("Holo!");
                google.maps.event.addListener($scope.map, 'click', function (event) {
                    placeMarker(event.latLng, $scope.addPersonalPointDlg);
                });
                function placeMarker(location, callback) {
                    var marker = new google.maps.Marker({
                        icon: '../img/Icons/2.png',
                        position: location,
                        map: $scope.map
                    });
                    var lat = location.lat();
                    var lang = location.lng();
                    pointService.setLocation(lat, lang);
                    callback();
                };
            }//end second if
        }//end main if
    };//end of getApoint function
      //******************************************************************************************************************
    $scope.showAdvanced = function () {
        $mdDialog.show({
            controller: pointCtrl,
            templateUrl: 'templates/Panel/addPoint.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    /* ########################################################################################################################## */
    $scope.addPersonalPointDlg = function () {
        $mdDialog.show({
            controller: pointCtrl,
            templateUrl: 'templates/Panel/addPersonalPoint.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    //******************************************************************************************************************
};
