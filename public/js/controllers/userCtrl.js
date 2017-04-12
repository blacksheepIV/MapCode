/**
 * Created by blackSheep on 09-Apr-17.
 */
var userCtrl = function($scope){
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
}//end of userCtrl controller