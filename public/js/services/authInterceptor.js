/**
 * Created by blackSheep on 20-Apr-17.
 */
var authInterceptor = function(authenticationToken){
    return {
        request: function(config) {
            var token = authenticationToken.getToken();

            if (token)
                config.headers.Authorization = 'Bearer ' + token;
          //  $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
            return config;
        },
        response: function(response) {
            return response;
        }
    };
}//end of authInterceptor service
