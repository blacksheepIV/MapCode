/**
 * Created by blackSheep on 10-May-17.
 */
function searchCtrl($scope,pointService,$location) {
    $scope.initSearch = function(){
       /* $scope.searchParams = {
            code: 0 ,
            name:'',
            owner:'',
            tags:[],
            city:'',
            category:''
        }; */
        $scope.PCode = 0;
        $scope.PName = '';
        $scope.POwner = '';
        $scope.PTags = [];
        $scope. PCity = '';
        $scope. PCategory = '';
    }; //end of function initSearch
    $scope.search = function(){
        $scope.searchResults = [];
        $scope.searchParams ={};
        angular.forEach($scope.searchForm, function(value, key) {
            if(key[0] == '$') return;
            console.log(typeof (key));
            console.log(key, value.$pristine);
            if(!value.$pristine){
                $scope.searchParams[key] = value.$modelValue;
            }
        });
        console.log($scope.searchParams);

        pointService.showSearchResult($scope.searchParams).then(
            function(searchResult){
                     console.log(searchResult);
                 $scope.searchResults = searchResult.data;
        },
            function(searchResult){
                console.log(searchResult);
            });
    };//end of search result
    $scope.takeMeHome = function(){
        $location.path('/');
    };//end of function takeMeHome
};//end of searchCtrl
