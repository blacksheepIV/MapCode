/**
 * Created by blackSheep on 31-Mar-17.
 */
var registerCtrl = function($scope,$rootScope,$location,$timeout,regService){
    $scope.initvars = function (){
         $scope.reSend = false;
        $scope.is2ndPage = false;
        $scope.levelPage(1,cb);
        $scope.user = {
            name: '',
            melli_code: 0,
            email: '',
            date: '',
            mobile_phone: '',
            phone: '',
            username: '',
            password: '',
            passRepeat:'',
            Corpname:'', //no corp name
            address: '',
            description: '',
            isRecommended: false,
            recommender: 0,
            type: '',
            code: '',
            credit: 0,
            bonus: 0
        }
    }//end ofo function initVars
    //****************************************************************************************************************************************
    //****************************************************************************************************************************************
    //******************************************************************************************************************
    $scope.cb = function(){
        if($scope.is2ndPage){
            $scope.user = regService.getUserInfo();
            console.log("we R here");
        }

    }//end of function cb
    //******************************************************************************************************************
$scope.levelPage = function(level,cb){
     switch (level){
         case 0:
             $location.path('/');
             cb();
             break;
         case 1:
             $rootScope.pageTitle = "ثبت نام";
             cb();
             break;
         case 2:
             $rootScope.pageTitle = "تایید ثبت نام"
             regService.setUserInfo($scope.user);
             console.log("hello");
             $scope.is2ndPage = true;
             cb();
             console.log("hello2");
             $location.path('/verify');
             break;
     }
}//end of function level page
    //******************************************************************************************************************
    //******************************************************************************************************************
    $scope.counter = 30;
    $scope.onTimeout=function(){
        $scope.counter --;
        mytimeout = $timeout($scope.onTimeout,1000);
        if($scope.counter == 0) {
            $timeout.cancel(mytimeout);
            $scope.reSend= true ;
        }
    }//end of function on time out
    var mytimeout = $timeout($scope.onTimeout,1000);
}//end of registerCtrl