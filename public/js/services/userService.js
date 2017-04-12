/**
 * Created by blackSheep on 04-Apr-17.
 */
var userService = function(){
    var user = {}; //empty object literal
    this.setUserInfo = function(userData){
        user = userData;
        console.log(user);
    }//end of function set user info
    this.getUserInfo = function(){
        console.log(user);
        return user;
    }//end of function get user info
}//end of regService function