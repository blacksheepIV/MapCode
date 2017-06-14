/**
 * Created by blackSheep on 08-Jun-17.
 */
function groupCtrl ($scope,groupService,toastr,$mdDialog,friendService){
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
    /* ################################################################################################################################### */
    $scope.gpInfo = function(gp){

       groupService.setGroup(gp);
        $mdDialog.show({
            controller: groupCtrl,
            templateUrl: 'templates/Panel/userPanelItems/groupStuff/gpInfo.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: false // Only for -xs, -sm breakpoints.
        });
    };//end of gpInfo function
    $scope.infoInit = function(){
        $scope.gp = groupService.getGroup();
    };
    /* ######################################################################################################################################### */
    $scope.loadfriends = function(){
        return  friendService.getFriends()
            .then(
                function(friendsList){
                    $scope.friends = friendsList.data;
                }
                ,function(friendsList){
                    console.log(friendsList);
                });
    };//end of loadfriends func

    $scope.createGp = function (){
        //console.log($scope.gpName);
       // console.log($scope.addedMembers);
        var group = {name:$scope.gpName,members:$scope.addedMembers};
        groupService.createGroup(group)
            .then(
                function(gpCreationResult){
                    // console.log(gpCreationResult);
                    toastr.success('گروه جدید ایجاد شد', 'موفقیت!');
                },
                function(gpCreationResult){
                    //console.log(gpCreationResult);
                    if(gpCreationResult.status === 400)
                        toastr.error(' گروهی با این نام از قبل وجود دارد ', 'خطا');
                });
    };
    /* ######################################################################################################################################### */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
    /* ########################################################################################################################################## */
    $scope.deleteMember = function(member,groupName){
        var foundIt = false;
        groupService.getGroupInfo(groupName).then(
            function(gpInfoResult)
            {
                var currentMembers = gpInfoResult.data.members;
                for(var j=0 ; j<currentMembers.length ; j++)
                    if(currentMembers[j] === member){
                        currentMembers.splice(j,1);
                        foundIt= true;
                        break;
                }
                if(!foundIt)
                    console.log("user is not a friend of yours!!!!");
                else if(foundIt){
                    var newGp = {new_members:currentMembers};
                    groupService.updateGroup(groupName,newGp)
                        .then(function(updateResult){
                            toastr.success('کاربر از گروه حذف شد.');
                        },function(updateResult){
                            console.log(updateResult);
                            toastr.error('خطایی روی داده است.');
                        });
                }



            },function(gpInfoResult){
                console.log(gpInfoResult);
            });
    };
};//end of groupCtrl func
