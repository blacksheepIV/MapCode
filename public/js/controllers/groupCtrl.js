/**
 * Created by blackSheep on 08-Jun-17.
 */
function groupCtrl ($scope,groupService,toastr){
    $scope.initGroup = function(){
        $scope.noGroup = true;
        $scope.groupList=[];
        groupService.getGroupsList().then(
            function(groupsList){
                if(groupsList.data.length >0)
                    $scope.noGroup = false;
                $scope.groupList = groupsList.data;
            },
            function(groupsList){
                console.log(groupsList);
            });
    };//end of initGroup function
/* ################################################################################################################# */
 $scope.DeleteGP = function(gpName){
     groupService.groupDeletion(gpName).then(
         function(deletionResult){
        // console.log(deletionResult);
             toastr.success('گروه حذف شد.');
     }
     ,function(deletionResult){
            // console.log(deletionResult);
             toastr.error(' در سیستم خطایی رخ داده', 'خطا');
         });
 };//end of
};//end of groupCtrl func
