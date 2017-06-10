/**
 * Created by blackSheep on 04-Apr-17.
 */
var userService = function($http){
    var user = {}; //empty object literal
    var verCode = -1;
    var usrInfo = {};
    var usr ="";
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
   this.searchUsers = function(name){
       var searchUser =  window.apiHref+"users/search";
       var searchingFor={username:name};
       return $http({url:searchUser,method:"GET",params:searchingFor});
   };//end of searchUsers func
    /* ############################################### get user Info############################################################# */
   this.getUsrInfo = function(name){
       var getThisUsr =  window.apiHref+"users/"+name;
       return $http({url:getThisUsr,method:"GET"});
   };//end of getUsrInfo function
    /* ############################################################################################################ */
    this.setUsername = function(usrname){
        usr = usrname;
        console.log(usr);
    };//end of setUsername function
    this.getUsername = function(){
        return usr;
    };//end of getUsername func
    /* ##################################### Get User's Point ######################################################### */
    this.GetPoints = function(username){
        var getPoint =  window.apiHref+"users/"+username+"/points";
        return $http({url:getPoint,method:"GET"});
    };
};//end of userService function