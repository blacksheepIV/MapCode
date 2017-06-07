 /**
 * Created by blackSheep on 19-Apr-17.
 */
var authenticationToken = function(localStorageService){
    var authToken = {
        savedToken : null,
    isAuthenticated :false ,
       setToken:function(token) {
           authToken.savedToken = token;
           if (localStorageService.isSupported) {
               localStorageService.set('userToken', token);
               authToken.isAuthenticated = true;
           }
           else
               console.log("localSession is not supported");
       },
        getToken:function () {
           if(! authToken.savedToken)
               authToken.savedToken=localStorageService.get('userToken');
           return authToken.savedToken;
        },
        removeToken:function(){
            authToken.savedToken = null;
            localStorageService.remove('userToken');
            authToken.isAuthenticated = false;
        }
    }; //end of authToken
    return authToken;
}//end of authenticationToken service