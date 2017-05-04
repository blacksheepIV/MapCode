/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function($scope,$rootScope,$mdSidenav,$log,$location,$mdToast,authenticationToken,$mdDialog,pointService,RegisteredUsr){
    $scope.initVar = function(){
        $scope.U = {
            name: "کاربر مهمان",
            credit: 0,
            bonus: 0
        };
        if(authenticationToken.getToken()) {
            $rootScope.isUser = true;
            RegisteredUsr.getUSrInfo().then(
                function(Info) {
                    $scope.U.name = Info.data.name;
                    $scope.U.credit = Info.data.credit;
                    $scope.U.bonus = Info.data.bonus;
                },
                function(Info){
                console.log(Info); //failure in obtaining data
                }
                );
        }
        console.log( $rootScope.isUser );
        $scope.customFullscreen = false;
        $scope.SearchTopics =[
            {id:1 , name:'کد نقطه'},
            {id:2 , name:'نام نقطه'},
            {id:3 , name:'نام کاربر ثبت کننده نقطه'},
            {id:4 , name:'تگ ها'},
            {id:5 , name:'نام کاربری'}
        ] ;
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 33.9870993, lng: 51.4405203},
            zoom: 10
            /* mapTypeIds: ['roadmap', 'satellite',
             'Dark'] */
        });
        // google.maps.event.addDomListener(window, 'load', initialize);
        google.maps.event.trigger(map, 'resize');

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
        //TODO:sth needed to distroy user's session/token,whatever
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $location.path("/");
    }
    //******************************************************************************************************************
    var last = {
        bottom: true,
        top: false,
        left: true,
        right: false
    };

    $scope.toastPosition = angular.extend({},last);

    $scope.getToastPosition = function() {
        sanitizePosition();

        return Object.keys($scope.toastPosition)
            .filter(function(pos) { return $scope.toastPosition[pos]; })
            .join(' ');
    };

    function sanitizePosition() {
        var current = $scope.toastPosition;

        if ( current.bottom && last.top ) current.top = false;
        if ( current.top && last.bottom ) current.bottom = false;
        if ( current.right && last.left ) current.left = false;
        if ( current.left && last.right ) current.right = false;

        last = angular.extend({},current);
    }
    //******************************************************************************************************************
     function showSimpleToast (){
         var pinTo = $scope.getToastPosition();
         $mdToast.show(
             $mdToast.simple()
                 .textContent('روی نقشه بیشتر زوم کنید')
                 .position(pinTo )
                 .hideDelay(3000)
         );
    };
    //******************************************************************************************************************
    $scope.showAdvanced = function() {
        $mdDialog.show({
            controller: pointCtrl,
            templateUrl: 'templates/Panel/addPoint.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    //******************************************************************************************************************
$scope.addPoint = function(){
    $scope.toggleRight();
    if($scope.map.getZoom() < 17) {
        showSimpleToast();
        $scope.map.addListener('zoom_changed', function () {
            console.log("user just zoomed the map in.");
            console.log($scope.map.getZoom());
        });
    } //end if condition
    if($scope.map.getZoom()>=17){
        google.maps.event.addListener($scope.map, 'click', function(event) {
            placeMarker(event.latLng,$scope.showAdvanced);
        });

        function placeMarker(location,callback) {
            var marker = new google.maps.Marker({
                icon:'../img/Icons/map-marker.png',
                position: location,
                map: $scope.map
            });
           // callback(location);
            var lat = location.lat();
            var lang = location.lng();
            pointService.setLocation(lat,lang);
            callback();
        }
    }//end if condition
}//end of addPoint
}//end of main controller