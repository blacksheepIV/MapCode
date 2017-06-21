/**
 * Created by blackSheep on 19-Jun-17.
 */
function mainViewCtrl ($scope,pointService,$state){
    $scope.initMainView = function(){
        $scope.searchBox = "";
        $scope.searchTopic = "";
        $scope.SearchTopics =[
            {id:1 , name:'کد نقطه', value:'code'},
            {id:2 , name:'نام نقطه',value:'name'},
            {id:3 , name:'نام کاربر ثبت کننده نقطه',value:'owner'},
            {id:4 , name:'تگ ها',value:'tags'},
            {id:5 , name:'شهر',value:'city'},
            {id:6 , name:'دسته بندی',value:'category'},
            {id:5 , name:'نام کاربری',value:'username'}
        ] ;
    };//end of initMainView
    /* ################################################################################################################### */
    $scope.searchPage = function(){
        var searchPrams = { key:$scope.searchTopic,value:$scope.searchBox};
        pointService.setSearchedValue(searchPrams);
        //$location.path('/advancedSearch');
        $state.go('advancedSearch');
    }

};//end of mainViewCtrl
