/**
 * Created by blackSheep on 04-Apr-17.
 */
var userService = function(){
    var user = {}; //empty object literal
    var verCode = -1;
    this.setUserInfo = function(userData){
        user = userData;
      //  console.log(user);
    };//end of function set user info
    this.getUserInfo = function(){
       // console.log(user);
        return user;
    };//end of function get user info

    var times=0;
    this.setUserTime=function(t){
        times = t;
        console.log("-ST-"+times);
    };
    this.getUserTime=function(){
        return times;
    };
    //****************************************************************************************************************

}//end of regService function