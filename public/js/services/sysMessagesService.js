/**
 * Created by blackSheep on 16-May-17.
 */
function sysMessagesService ($mdDialog,$scope){
    var sysMessagesService = {
        showMsg : function (MsgTitle,MsgContent,OkTxt) {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title(MsgTitle)
                .textContent(MsgContent)
                .ariaLabel('successDialog')
                .ok(OkTxt)
        );
    }
    };
    return sysMessagesService;
};//end of sysMessagesService