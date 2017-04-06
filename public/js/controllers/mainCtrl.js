/**
 * Created by blackSheep on 03-Apr-17.
 */
var mainCtrl = function($scope,$mdSidenav){
    $scope.toogleRight= buildToggler('right');
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
    //******************************************************************************************************************
    var map = new google.maps.Map(document.getElementById('map'),{
            center:{lat:33.9870993,lng:51.4405203},
            zoom:11
        })
}//end of main controller