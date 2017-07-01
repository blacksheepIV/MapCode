/**
 * Created by blackSheep on 10-May-17.
 */
function searchCtrl($scope,pointService,$state,userService,toastr,$mdDialog) {
    $scope.initSearch = function(){
        $scope.PCode = 0;
        $scope.PName = '';
        $scope.POwner = '';
        $scope.PTags = [];
        $scope. PCity = '';
        $scope. PCategory = '';
        $scope.username = '';
        $scope.simpleSearch = false;
        $scope.searchingUser = false;
        $scope.simpleSearchPrams = {};
        $scope.lookingForusers = false;
        $scope.foundedUsers = [];
        $scope.sthWentWrong = false;
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
        var temp = pointService.getSearchedValue();
        if(temp ){
            $scope.searchTopic = 'name';
            $scope.PName = temp;
            $scope.simpleSearch = true;
            $scope.simpleSearchPrams["name"] = temp;
            console.log($scope.simpleSearchPrams);
        }//end if condition
     /*  if( temp !== null){
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
                case 'username':
                    $scope.lookingForusers = true;
                    userService.searchUsers(temp.value).then(
                        function (data) {
                            console.log(data);
                            $scope.foundedUsers=data.data;
                        },function (data) {
                            $scope.sthWentWrong = true;
                            if(data.status === 400)
                                toastr.error('جستجو برای نام کاربری بدون در نظر کرفتن مقدار یا نام کاربری غیر معتبر(طول کمتر از 5)', {
                                    closeButton: true
                                });
                            else if(data.status === 404)
                                toastr.warning('متاسفانه کاربری با این نام کاربری یافت نشد):', {
                                    closeButton: true
                                });
                        }
                    );
                    break;
            };
        } */
    }; //end of function initSearch
    /* ############################################################################################################################################################################## */
    $scope.showUserInfo = function(user,ev){
       // userService.setUsrInfo(user);
        userService.setUsername (user.username);
        $mdDialog.show({
            controller: usrInfoCtrl,
            templateUrl: 'templates/Panel/userInfo.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });

    };//end of function showUserInfo
    /* ############################################################################################################################################################################ */
    $scope.search = function(searchForm){
        $scope.searchResults = [];
        $scope.searchParams = {};
        if($scope.simpleSearch) {
            $scope.searchParams = $scope.simpleSearchPrams;
            console.log($scope.simpleSearchPrams);
        }
        angular.forEach(searchForm ,function(value, key) {
            if(key[0] == '$') return;
          //  console.log(key,value);
            if(!value.$pristine && value.$modelValue ){
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
                if(searchResult.status === 404)
                    toastr.info('متاسفانه نتیجه ای یافت نشد!', 'بی نتیجه',{ closeButton: true});
            });
    };//end of search result
    //##################################################################################################################################################################################
    $scope.userSearch = function(searchForUser){
        angular.forEach(searchForUser ,function(value, key) {
            if(key[0] == '$') return;
            //  console.log(key,value);
            if(!value.$pristine && value.$modelValue ){
                $scope.username = value.$modelValue;
            }
        });
        console.log($scope.username);
        userService.searchUsers($scope.username).then(
            function (data) {
                console.log(data);
                $scope.foundedUsers = data.data;
            }, function (data) {
                $scope.sthWentWrong = true;
                if (data.status === 400)
                    toastr.error('جستجو برای نام کاربری بدون در نظر کرفتن مقدار یا نام کاربری غیر معتبر(طول کمتر از 5)', {
                        closeButton: true
                    });
                else if (data.status === 404)
                    toastr.warning('متاسفانه کاربری با این نام کاربری یافت نشد):', {
                        closeButton: true
                    });
            }
        );

    };//end of userSearch func
    //##################################################################################################################################################################################
    $scope.takeMeHome = function(){
        $state.go('home');
    };//end of function takeMeHome
};//end of searchCtrl
