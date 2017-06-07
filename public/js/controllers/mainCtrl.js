/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function($scope,$rootScope,$mdSidenav,$log,$state,$mdToast,authenticationToken,$mdDialog,pointService,RegisteredUsr,$window){
    $scope.initVar = function(){
      $scope.toggleFlag = true;
      $scope.searchBox = "";
        $scope.searchTopic = "";
        $rootScope.isUser = false;
        $scope.U = {
            name: "کاربر مهمان",
            credit: 0,
            bonus: 0
        };
        if(authenticationToken.getToken()) {
            $rootScope.isUser = true;
            console.log(authenticationToken.getToken());
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
        } //why it is called 3 times?
       // console.log( $rootScope.isUser );
        $scope.customFullscreen = false;
        $scope.SearchTopics =[
            {id:1 , name:'کد نقطه', value:'code'},
            {id:2 , name:'نام نقطه',value:'name'},
            {id:3 , name:'نام کاربر ثبت کننده نقطه',value:'owner'},
            {id:4 , name:'تگ ها',value:'tags'},
            {id:5 , name:'شهر',value:'city'},
            {id:6 , name:'دسته بندی',value:'category'},
            {id:5 , name:'نام کاربری',value:'username'}
        ] ;
        $scope.initMap();
    }//end of initVar
    //################################################################################################################################################################################
    $scope.initMap = function(){
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 33.9870993, lng: 51.4405203},
            zoom: 10
        });
        google.maps.event.addDomListener($window, 'load',   $scope.initMap);
        google.maps.event.trigger( $scope.map, 'resize');
    };
    //################################################################################################################################################################################
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
      //  $location.path("/login");
        $state.go('login');
    };
    $scope.register=function(){
        //$location.path("/registration");
        $state.go('registration');
    };
    $scope.logOut=function(){
        console.log("user just logged out.");
        //TODO:sth needed to distroy user's session/token,whatever
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        //$location.path("/");
        $state.go('home');
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
    /* ########################################################################################################################## */
    $scope.addPersonalPointDlg = function(){
        $mdDialog.show({
            controller: pointCtrl,
            templateUrl: 'templates/Panel/addPersonalPoint.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    //******************************************************************************************************************
$scope.addPoint = function(){
    $scope.toggleRight();
    if($scope.map.getZoom() < 15) {
        showSimpleToast();
        $scope.map.addListener('zoom_changed', function () {
            console.log("user just zoomed the map in.");
            console.log($scope.map.getZoom());
        });
    } //end if condition
    if($scope.map.getZoom()>=15){
        google.maps.event.addListener($scope.map, 'click', function(event) {
            placeMarker(event.latLng,$scope.showAdvanced);
        });

        function placeMarker(location,callback) {
            var marker = new google.maps.Marker({
                icon:'../img/Icons/1.png',
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
};//end of addPoint
    //######################################################################################################################################
    $scope.addPersonalPoint = function(){
            $scope.toggleRight();

        if($scope.map.getZoom() < 15) {
            showSimpleToast();
            $scope.map.addListener('zoom_changed', function () {
                console.log("user just zoomed the map in.");
                console.log($scope.map.getZoom());
            });
        } //end if condition
        if($scope.map.getZoom()>=15){
            google.maps.event.addListener($scope.map, 'click', function(event) {
                placeMarker(event.latLng,$scope.addPersonalPointDlg);
                //return;
            });

            function placeMarker(location,callback) {
                var marker = new google.maps.Marker({
                    icon:'../img/Icons/2.png',
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
    };//end of addPersonalPoint
    //######################################################################################################################################
$scope.searchPage = function(){
    var searchPrams = { key:$scope.searchTopic,value:$scope.searchBox};
    pointService.setSearchedValue(searchPrams);
    //$location.path('/advancedSearch');
    $state.go('advancedSearch');
}
}//end of main controller