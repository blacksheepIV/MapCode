/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function($scope,$rootScope,$mdSidenav,$log,$location,$mdToast,authenticationToken){
    $rootScope.guest = true; // we have a guest in the site;so some parts should be disabled
    console.log(authenticationToken.isAuthenticated);
    if(authenticationToken.isAuthenticated)
        $rootScope.isUser = true;
    console.log( $rootScope.isUser );
    $scope.initVar = function(){
        $scope.SearchTopics =[
            {id:1 , name:'کد نقطه'},
            {id:2 , name:'نام نقطه'},
            {id:3 , name:'نام کاربر ثبت کننده نقطه'},
            {id:4 , name:'تگ ها'},
            {id:5 , name:'نام کاربری'},
        ] ;
        $scope.map = new google.maps.Map(document.getElementById('map'),{
            center:{lat:33.9870993,lng:51.4405203},
            zoom:10
        });

       /* var marker = new google.maps.Marker({
            position:{lat:33.9870993,lng:51.4405203},
            map:map,
            draggable:true,
            title:"drag me!"
        }); */
        google.maps.event.addListener($scope.map, 'click', function(event) {
            placeMarker(event.latLng);
        });

        function placeMarker(location) {
            var marker = new google.maps.Marker({
                position: location,
                map: $scope.map
            });
        }

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
$scope.addPoint = function(){
    $scope.toggleRight();
    if($scope.map.getZoom() < 15) {
        showSimpleToast();
        $scope.map.addListener('zoom_changed', function () {
            console.log("user just zoomed the map in.");
            console.log($scope.map.getZoom());
        });
    } //end if condition
}//end of addPoint
}//end of main controller