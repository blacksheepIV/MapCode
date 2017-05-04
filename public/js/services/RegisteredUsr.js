/**
 * Created by blackSheep on 27-Apr-17.
 */
function RegisteredUsr ($http,$location,$rootScope,authenticationToken){
    var registeredUsr ={
        Info : null,
        response:null,
        getUSrInfo:function(){
           return $http.get(window.apiHref+"users/")
               .success(function(data){
                   registeredUsr.Info = data;
               });
        },
        updateUsrInfo:function(alteredData){
            return  $http({
                url : window.apiHref+"users/" ,
                method: "PUT",
                data: alteredData
            })
                .success(function(data){
                    registeredUsr.response = data;
                });
        },
        goodriddance:function(){
        authenticationToken.removeToken();
        $rootScope.isUser = false;
        $location.path("/login");
    }
    };
    return registeredUsr;
};//end of service
