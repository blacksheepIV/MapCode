/**
 * Created by blackSheep on 31-Mar-17.
 */
var registerCtrl = function($scope,$rootScope,$location,$timeout,regService){
    $scope.initvars = function (){
         $scope.reSend = false;
        $scope.resubmits = 0; //counts the times user asked for resubmission
       // $scope.is2ndPage = false;
        $scope.emailPattern = /^([a-zA-Z0-9])+([a-zA-Z0-9._%+-])+@([a-zA-Z0-9_.-])+\.(([a-zA-Z]){2,6})$/;
        $scope.levelPage(1);
        $rootScope.user = {
            name: '',
            melli_code: 0,
            email: '',
            date: '',
            mobile_phone: '',
            phone: '',
            username: '',
            password: '',
            passRepeat:'',
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
$scope.levelPage = function(level){
     switch (level){
         case 0:
             $location.path('/');
             break;
         case 1:
             $rootScope.pageTitle = "ثبت نام";
             break;
         case 2:
             $rootScope.pageTitle = "تایید ثبت نام"
             if($rootScope.user.password!= $rootScope.user.passRepeat)
                 console.log("پسوردها مشابه نیستند!!!");
             regService.setUserInfo($rootScope.user);
             /*$scope.is2ndPage = true;
             cb(); */
             console.log($rootScope.user);
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
    //********************************************************************************************************************
    $scope.resendCode=function(){
        //here u gotta send a request to server to ask for code again
        $sope.resubmits++;//we addup the counter ;when it reaches to it's limit u gotta cancel the users registration
    }
    //******************************************************Persian_DatePicker config*********************************************************
   /* $(document).ready(function () {
        $("#Bdate").pDatepicker(
            {
                altField: '#dateALT',
                altFormat: 'unix',
                timePicker: {
                    enabled: true,
                    showSeconds: true,
                    showMeridian: true,
                    scrollEnabled: false,

                },

                autoClose: true
    });
    }); */
}//end of registerCtrl