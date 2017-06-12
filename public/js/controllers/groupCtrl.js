/**
 * Created by blackSheep on 08-Jun-17.
 */
function groupCtrl ($scope,groupService,toastr,$mdDialog,friendService,toastr){
    $scope.initGroup = function(){
        $scope.noGroup = true;
        $scope.groupList=[];
        $scope.friendList = [];
       // $scope.selectedItem = "";
        $scope.alreadyAmember = [];
        $scope.addedFriend = "";
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
 };//end of DeleteGP func
    /* ####################################################################################################################### */
    $scope.editGroup = function(name,ev){
        friendService.getFriends()
            .then(
                function(friendsList){
                    $scope.friendList = friendsList.data;
                    groupService.getGroupInfo(name).then(
                        function(gpInfoResult){
                            $scope.alreadymember = gpInfoResult.data.members;
                            for(var j=0; j<$scope.alreadymember.length; j++)
                                $scope.findAlreadyMembers($scope.alreadymember[j]);
                          //  $scope.selectedItem = $scope.friendList[0];
                            console.log($scope.friendList);
                            groupService.setSharedInfo($scope.friendList,name);
                            $mdDialog.show({
                                controller: gpEditCtrl,
                                templateUrl: 'templates/Panel/userPanelItems/groupStuff/editGroup.html',
                                parent: angular.element(document.body),
                                clickOutsideToClose:true,
                                fullscreen: false // Only for -xs, -sm breakpoints.
                            });
                        },
                        function(gpInfoResult){
                            console.log(gpInfoResult);
                        });
                }
                ,function(friendsList){
                    toastr.error('ناتوانی در دریافت لیست دوستان ', 'خطا');
                });

    };//end of editGroup
    /* ################################################################################################################################ */
    $scope.findAlreadyMembers = function(key){
        for(var j=0; j<$scope.friendList.length; j++)
            if($scope.friendList[j]=== key){
                $scope.friendList.splice(j,1);
               // console.log($scope.friendList);
            }
    };//end of findAlreadyMembers
};//end of groupCtrl func
