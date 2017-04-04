/**
 * Created by blackSheep on 31-Mar-17.
 */
var registerCtrl = function($scope,$rootScope,$location,vcRecaptchaService,$timeout,regService){
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
    $scope.response = null;
    $scope.widgetId = null;
    $scope.model = {
        key: '6LcZABsUAAAAAJOp9hdYFPexrD9F1ZJde4MXr5Wp'
    };
    $scope.setResponse = function (response) {
        console.info('Response available');
        $scope.response = response;
    };
    $scope.setWidgetId = function (widgetId) {
        console.info('Created widget ID: %s', widgetId);
        $scope.widgetId = widgetId;
    };
    $scope.cbExpiration = function() {
        console.info('Captcha expired. Resetting response object');
        vcRecaptchaService.reload($scope.widgetId);
        $scope.response = null;
    };
    $scope.submit = function () {
        var valid;
        /**
         * SERVER SIDE VALIDATION
         *
         * You need to implement your server side validation here.
         * Send the reCaptcha response to the server and use some of the server side APIs to validate it
         * See https://developers.google.com/recaptcha/docs/verify
         */
        console.log('sending the captcha response to the server', $scope.response);
        if (valid) {
            console.log('Success');
        } else {
            console.log('Failed validation');
            // In case of a failed validation you need to reload the captcha
            // because each response can be checked just once
            vcRecaptchaService.reload($scope.widgetId);
        }
    };
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