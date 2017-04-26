/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function($scope,$http,authenticationToken,$rootScope){
    $scope.initVars = function(){
        $scope.investigate = false; // user's not been investigated and approved yet
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
            address: '',
            description: '',
            isRecommended: false,
            recommender: 0,
            type: '',
            code: '',
            credit: 0,
            bonus: 0
        };
        //****************************************************************************************
        $http.get(window.apiHref+"users/").then(
            function (res) {
                console.log(res);
                $scope.user = {
                    name: res.data.name,
                    melli_code: res.data.melli_code,
                    email: res.data.email,
                    date: res.data.date,
                    mobile_phone: res.data.mobile_phone,
                    phone: res.data.phone,
                    username:res.data.username,
                    password: '',
                    passRepeat:'',
                    address: res.data.address,
                    description:res.data.description,
                    isRecommended: false,
                    recommender: res.data.recommender_user,
                    type: res.data.type,
                    code: '',
                    credit: res.data.credit,
                    bonus: res.data.bonus
                };

            },function (res) {
                if(res.status === 401) {
                    console.log("نقض قوانین!کاربر احراز هویت نشده!");
                    $scope.goodriddance();
                }
                if(res.status === 404){
                    console.log("کاربری با این مشخصات در سامانه وجود ندارد.");
                    $scope.goodriddance();
                }

            }
        );
        //****************************************************************************************

        //u get user's type from database;store it in a variable and then the user's type gotta be equal to that value
    };
    $(document).ready(function () {
        $("#creationDate").pDatepicker(
            {
                format:"YYYY - MM - DD dddd",
                viewMode : "year",
                persianDigit: true,
                altField: '#dateAltEdit',
                altFormat: 'unix',
                position: "auto",
                autoClose: true
            });
    });
//**********************************************************************************************************************
    $scope.goodriddance=function(){
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $location.path("/");
    };
    //******************************************************************************************************************

}//end of userCtrl controller