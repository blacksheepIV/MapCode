/**
 * Created by blackSheep on 19-Apr-17.
 */
var authentication = function($http,$rootScope){
    var auth = {
        response :[] ,
            validateUser:validateUser
    };
    return auth;
    function validateUser(user){

       return $http.post($rootScope.urlAdd+"api/signin/", user )
            .success(function(data){
               auth.response = data
            })//successful request to server
           .error(function(){
               console.log("sth did not go well!");
           });
    }; //end validation function
}//end of authentication function
