/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function($scope,$http,$rootScope,RegisteredUsr,localStorageService){
    $scope.initVars = function(){
        $scope.investigate = false; // user's not been investigated and approved yet
        $scope.myPoint = null;
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

    //******************************************************************************************************************

}//end of userCtrl controller