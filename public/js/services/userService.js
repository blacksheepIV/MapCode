/**
 * Created by blackSheep on 04-Apr-17.
 */
var userService = function($http){
    var user = {}; //empty object literal
    var verCode = -1;
    var usrInfo = {};
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
   this.searchUsers = function(username){
       var searchUser =  window.apiHref+"users/"+username;
       return $http({url:searchUser,method:"GET"});
   };//end of searchUsers func
    this.setUsrInfo = function (info){
        usrInfo = info;
    };
    this.getUsrInfo = function(){
        return usrInfo;
    };
    /* ##################################### Get User's Point ######################################################### */
    this.GetPoints = function(username){
        var getPoint =  window.apiHref+"users/"+username+"/points";
        return $http({url:getPoint,method:"GET"});
    };
};//end of userService function