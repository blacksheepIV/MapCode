/**
 * Created by blackSheep on 04-Apr-17.
 */
var regService = function(){
    var user = {}; //empty object literal
    this.setUserInfo = function(userData){
        user = userData;
    }//end of function set user info
    this.getUserInfo = function(){
        return user;
    }//end of function get user info
}//end of regService function