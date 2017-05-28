/**
 * Created by blackSheep on 26-May-17.
 */
function msgCTRL ($scope,msgService,toastr,$mdDialog){
    $scope.msgInit = function (){
        $scope.inboxMsgs = [];
        $scope.thereIsNoMsg = false;
        $scope.outboxMsgs = [];
        $scope.noSentMsgs = false;
        $scope.checkTypes = ['صندوق خروجی','صندوق ورودی'];
        msgService.getInboxMsgs().then(
            function(inboxResult){
             console.log(inboxResult);
                if(inboxResult.data.length === 0)
                    $scope.thereIsNoMsg = true;
                else {
                    $scope.inboxMsgs = [];
                    console.log($scope.inboxMsgs);
                    $scope.inboxMsgs = inboxResult.data;
                    console.log($scope.inboxMsgs);
                }
            },
            function(inboxResult){
                console.log(inboxResult);
            });
        msgService.getOutboxMsgs().then(
            function(outboxResult){
                console.log(outboxResult);
                if(outboxResult.data.length === 0)
                    $scope.noSentMsgs = true;
                else{
                    $scope.outboxMsgs = [];
                    $scope.outboxMsgs = outboxResult.data;
                }
        },
            function(outboxResult){
            console.log(outboxResult);
        });
    }; //end of msgInit
    /* #################################################################################################################### */
    $scope.deleteMsg = function(msgCode){
        //console.log(msgCode);
        msgService.deleteMsg(msgCode).then(
            function(deleteResult){
                console.log(deleteResult);
                toastr.info( 'پیغام حذف شد!', {
                    closeButton: true
                });
            }
            ,function(deleteResult){
                console.log(deleteResult);
            }
        );
    };//end of deleteMsg
    /* #################################################################################################################### */
    $scope.showMsgContent = function(msgCode,ev){
          msgService.showContent(msgCode)
              .then(function(contentResult){
                  console.log(contentResult);
                  if(contentResult.data.message === ""  )
                      toastr.info( 'متنی برای نمایش وجود ندارد', {
                          closeButton: true
                      });
                  else{
                      var confirm = $mdDialog.confirm()
                          .title(contentResult.data.point_code)
                          .textContent(contentResult.data.message)
                          .ariaLabel('msgContent')
                          .targetEvent(ev)
                          .ok('خوانده شد')
                          .cancel('بستن');

                      $mdDialog.show(confirm);
                  }

              },
                  function(contentResult){
                      console.log(contentResult);
                      if(contentResult.status === 404)
                          toastr.error( 'خطای 404','پیغامی یافت نشد!', {
                              closeButton: true
                          });
                  });
    };
};//end of msgCTRL
