/**
 * Created by blackSheep on 26-May-17.
 */
function msgService ($http){
    var message = {
        inboxResult : {},
        sentResult :{},
        getInboxMsgs : function(){
            var getInbox = window.apiHref + 'messages';
            return $http({url:getInbox,method:'GET'})
                .success(function(data){
                    message.inboxResult = data;
                });
        },
        sendMsg : function(msg){
            var sndMsg = window.apiHref + 'messages';
            return $http({url:sndMsg,method:'POST',data:msg})
                .success(function(data){
                    message.sentResult = data;
            });
        }
    };
    return message;
};//end of msgService
