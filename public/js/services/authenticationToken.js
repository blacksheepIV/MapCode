/**
 * Created by blackSheep on 19-Apr-17.
 */
var authenticationToken = function(localStorageService){
    var authToken = {
        savedToken : null,
    isAuthenticated :false ,
       setToken:function(token) {
           savedToken = token;
           if (localStorageService.isSupported) {
               localStorageService.set('userToken', token);
               isAuthenticated = true;
           }
           else
               console.log("localSession is not supported");
       },
        getToken:function () {
           if(!savedToken)
              savedToken=localStorageService.get('userToken');
           return savedToken;
        },
        removeToken:function(){
            savedToken = null;
            localStorageService.remove('userToken');
            isAuthenticated = false;
        }
    }; //end of authToken
    return authToken;
}//end of authenticationToken service