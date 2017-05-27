/**
 * Created by blackSheep on 21-May-17.
 */
var friendService = function ($http){
  var friend = {
       friendsList : [] ,
      requestResult : null ,
      requestList : {} ,
      acceptResult : {},
      cancelResult :{},
      getFriends : function(){
           var getFriend = window.apiHref + 'friends';
           return $http({url:getFriend,method:'GET'})
                        .success(function(data){
               friend.friendsList = data;
           });
      },
      sendFriendReq : function(userName){
          var sendRequest =  window.apiHref + 'friends';
          return $http({url:sendRequest,method:'POST',data:userName})
                       .success(function(data){
                           friendService.requestResult = data;
                       });
      },
      getAlistOfFriendRequest : function(){
          var getRequests = window.apiHref + 'friends/requests/';
          return $http({url:getRequests,method:'GET'})
              .success(function(data){
                  friendService.requestList = data;
              });
      },
      acceptFriendReq : function(userName){
          var acceptUrl = window.apiHref +'friends/accept/'+userName;
          console.log(acceptUrl);
          return $http({url:acceptUrl,method:'POST'})
              .success(function(data){
                  console.log(data);
                  friendService.acceptResult = data;
              });
      },
      cancelFriendReq : function(userName){
          var cancelUrl = window.apiHref + 'friends/cancel/'+userName;
          console.log(cancelUrl);
          return $http({url:cancelUrl,method:'POST'})
              .success(function(data){
                  friendService.cancelResult = data;
              });
      }
  };
  return friend;
};//end of friendService
