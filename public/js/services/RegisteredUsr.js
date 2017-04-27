/**
 * Created by blackSheep on 27-Apr-17.
 */
function RegisteredUsr ($http,$location,$rootScope){
    var registeredUsr ={
        Info : null,
        getUSrInfo:function(){
           return $http.get(window.apiHref+"users/")
               .success(function(data){
                   registeredUsr.Info = data;
               });
        },
        goodriddance:function(){
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $location.path("/");
    }
    };
    return registeredUsr;
};//end of service
