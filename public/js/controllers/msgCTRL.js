/**
 * Created by blackSheep on 26-May-17.
 */
function msgCTRL ($scope,msgService){
    $scope.msgInit = function (){
        $scope.inboxMsgs = [];
        $scope.thereIsNoMsg = false;
        msgService.getInboxMsgs().then(
            function(inboxResult){
             console.log(inboxResult);
                if(inboxResult.data.length === 0)
                    $scope.thereIsNoMsg = true;
                else {
                    $scope.inboxMsgs = inboxResult.data;
                    console.log($scope.inboxMsgs);
                }
            },
            function(inboxResult){
                console.log(inboxResult);
            });
    }; //end of msgInit
};//end of msgCTRL
