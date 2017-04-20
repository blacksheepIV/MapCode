/**
 * Created by blackSheep on 19-Apr-17.
 */
var authentication = function($http,$location){
    var auth = {
        response :[] ,
            validateUser:validateUser
    };
    return auth;
    function validateUser(user){

       return $http.post("http://localhost:3000/api/signin/", user )
            .success(function(data){
               auth.response = data
            })//successful request to server
           .error(function(){
               console.log("can't connect to server!");
           });
    }; //end validation function
}//end of authentication function
