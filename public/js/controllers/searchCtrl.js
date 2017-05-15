/**
 * Created by blackSheep on 10-May-17.
 */
function searchCtrl($scope,pointService,$location,$log) {
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
        $scope.simpleSearch = false;
        $scope.simpleSearchPrams = {};
        var temp = pointService.getSearchedValue();
        if( temp !== null){
            switch(temp.key){
                case 'name':
                   $scope.PName = temp.value;
                    $scope.simpleSearch = true;
                    $scope.simpleSearchPrams[temp.key] = temp.value;
                    break;
                case 'code':
                    $scope.PCode = temp.value;
                    $scope.simpleSearch = true;
                    $scope.simpleSearchPrams[temp.key] = temp.value;
                    break;
                case 'owner':
                    $scope.POwner = temp.value;
                    $scope.simpleSearch = true;
                    $scope.simpleSearchPrams[temp.key] = temp.value;
                    break;
                case 'tags':
                    $scope.PTags = temp.value;
                    $scope.simpleSearch = true;
                    $scope.simpleSearchPrams[temp.key] = temp.value;
                    break;
                case 'city':
                    $scope.PCity = temp.value;
                    $scope.simpleSearch = true;
                    $scope.simpleSearchPrams[temp.key] = temp.value;
                    break;
                case 'category':
                    $scope. PCategory =  temp.value;
                    $scope.simpleSearch = true;
                    $scope.simpleSearchPrams[temp.key] = temp.value;
                    break;
            };
        }
    }; //end of function initSearch
    //###############################################################################################################################################################################
    $scope.search = function(){
        $scope.searchResults = [];
        $scope.searchParams ={};

        if($scope.simpleSearch) {
            $scope.searchParams = $scope.simpleSearchPrams;
            console.log($scope.simpleSearchPrams);
        }
        angular.forEach($scope.searchForm, function(value, key) {
            if(key[0] == '$') return;
           // console.log(key, value.$pristine);
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
    //##################################################################################################################################################################################
    $scope.takeMeHome = function(){
        $location.path('/');
    };//end of function takeMeHome
};//end of searchCtrl
