/**
 * Created by blackSheep on 19-Jun-17.
 */
function mainViewCtrl($scope, pointService, $state) {
    $scope.initMainView = function () {
        $scope.searchBox = "";

    };//end of initMainView
    /* ################################################################################################################### */
    $scope.searchPage = function () {
        //  var searchPrams = { key:$scope.searchTopic,value:$scope.searchBox};
        var searchPram = $scope.searchBox;
        pointService.setSearchedValue(searchPram);
        $state.go('advancedSearch');
    };
    /*  $('#filtersubmit').click(function() {
     $scope.searchPage();
     }); */
};//end of mainViewCtrl
