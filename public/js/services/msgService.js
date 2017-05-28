/**
 * Created by blackSheep on 26-May-17.
 */
function msgService ($http){
    var message = {
        inboxResult : {},
        sentResult :{},
        deleteResult : {},
        outboxResult : {},
        contentResult : {},
        getInboxMsgs : function(){
            var getInbox = window.apiHref + 'messages';
            return $http({url:getInbox,method:'GET'})
                .success(function(data){
                    message.inboxResult = {};
                    console.log(message.inboxResult);
                    message.inboxResult = data;
                    console.log(message.inboxResult);
                });
        },
        sendMsg : function(msg){
            var sndMsg = window.apiHref + 'messages';
            return $http({url:sndMsg,method:'POST',data:msg})
                .success(function(data){
                    message.sentResult = data;
            });
        },
        deleteMsg : function(msgCode){
            var deleteUrl = window.apiHref + 'messages/'+msgCode;
            return $http({url:deleteUrl,method:'DELETE'})
                .success (function(data){
                    message.deleteResult = data;
                });
        },
        getOutboxMsgs : function(){
            var getOutbox = window.apiHref + 'messages/outbox';
            return $http({url:getOutbox,method:'GET'})
                .success(function(data){
                    message.outboxResult = {};
                    message.outboxResult = data;
                    console.log(message.outboxResult);
                });
    },
        showContent : function(code){
            var getContentUrl = window.apiHref + 'messages/'+code;
            //console.log(getContentUrl);
            return $http({url:getContentUrl,method:'GET'})
                .success(
                    function(data) {
                        message.contentResult = {};
                        message.contentResult = data;
                    });
        }
    };
    return message;
};//end of msgService
