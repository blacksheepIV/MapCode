/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function($scope,$http,$rootScope,RegisteredUsr,localStorageService,$location){
    $scope.initVars = function(){
        $scope.investigate = false; // user's not been investigated and approved yet
        $scope.myPoint = {};
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
        RegisteredUsr.getUSrInfo().then(
            function (Info) {
                console.log(Info);
                $scope.user = {
                    name: Info.data.name,
                    melli_code: Info.data.melli_code,
                    email: Info.data.email,
                    date: Info.data.date,
                    mobile_phone: Info.data.mobile_phone,
                    phone: Info.data.phone,
                    username:Info.data.username,
                    password: '',
                    passRepeat:'',
                    address: Info.data.address,
                    description:Info.data.description,
                    isRecommended: false,
                    recommender: Info.data.recommender_user,
                    code: '',
                    credit: Info.data.credit,
                    bonus: Info.data.bonus
                };
                console.log(Info.data.type);
                switch( Info.data.type ){
                    case 0 :
                        $scope.investigate = false;
                        $scope.user.type = "حقیقی تایید نشده";
                        break;
                    case 2:
                        $scope.investigate = false;
                        $scope.user.type = "حقوقی تایید نشده";
                        break;
                    default:
                        $scope.user.type = " ";
                        break;
                }; //end of switchCase
               /* var pointUrl = window.apiHref+"point/?public?start=1?limit=1";
                $http({
                    url : pointUrl ,
                    method: "GET"
                })
                    .then(function(data){
                        console.log(data);
                    },function(data){
                        console.log(data);
                    }); */

            },function (Info) {
                if(Info.status === 401) {
                    console.log("نقض قوانین!کاربر احراز هویت نشده!");
                    RegisteredUsr.goodriddance();
                }
                if(Info.status === 404){
                    console.log("کاربری با این مشخصات در سامانه وجود ندارد.");
                    RegisteredUsr.goodriddance();
                }

            }
        );
        //****************************************************************************************
        if(localStorageService.isSupported) {
           $scope.myPoint = localStorageService.get('point1');
            console.log($scope.myPoint);
        }


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
$scope.takeMeHome =  function(){
    $location.path('/');
};//end of function take me home
    //******************************************************************************************************************
    var originatorEv;

   /* this.openMenu = function($mdMenu, ev) {
        originatorEv = ev;
        $mdMenu.open(ev);
    }; */
//*************************************************************************************************************************
}//end of userCtrl controller