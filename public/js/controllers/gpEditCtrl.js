/**
 * Created by blackSheep on 12-Jun-17.
 */
function gpEditCtrl ($scope,groupService,$mdDialog,toastr){
    $scope.initEdit = function(){
        $scope.addedFriend = [];
        $scope.gpInfo = groupService.getSharedInfo();
        $scope.gpName = $scope.gpInfo.name;
        $scope.friendList = $scope.gpInfo.friends;
        console.log($scope.gpInfo.members);
    };
    /* ##################################################################################################################### */
    $scope.submit = function(){
        var goodToGo = true;
        var newGroup={
            new_name:$scope.gpInfo.name,
            new_members:[]
        };
      //  console.log($scope.addedFriend);
     /*   angular.forEach($scope.editGroup, function(value, key) {
            if(key[0] == '$') return;
            if(value.$dirty){
                console.log(key);
                console.log(value.$modelValue);
                newGroup[key] = value.$modelValue;
            }
        }); */
       //TODO:Due to angular own bug with md-select multiple and $pristine I'm doomed
       /* if($scope.editGroup.new_members.$dirty && $scope.editGroup.new_name.$pristine ) {
            newGroup.new_members = $scope.addedFriend;
            console.log("hello");
        } */
        if($scope.addedFriend.length === 0 &&  $scope.editGroup.new_name.$pristine ) {
            toastr.warning('هیچ یک از فیلدها پر نشده است');
            goodToGo = false;
        }
        else if ($scope.addedFriend.length === 0 &&  !$scope.editGroup.new_name.$pristine)
            newGroup.new_name = $scope.gpName ;
        else if($scope.addedFriend.length !== 0 &&  !$scope.editGroup.new_name.$pristine){
            newGroup.new_name = $scope.gpName ;
            newGroup. new_members = $scope.addedFriend ;
            newGroup.new_members.push($scope.gpInfo.members);
        }
        else if($scope.addedFriend.length !== 0 &&  $scope.editGroup.new_name.$pristine) {
            newGroup.new_members = $scope.addedFriend;
            newGroup.new_members.push($scope.gpInfo.members);
        }
        if(goodToGo) {
            groupService.updateGroup($scope.gpInfo.name, newGroup).then(
                function (updateResult) {
                    console.log(updateResult);
                    toastr.success('اطلاعات گروه بروزرسانی شد.');
                }
                , function (updateResult) {
                    console.log(updateResult);
                    toastr.error(' در سیستم خطایی رخ داده', 'خطا');
                });
        }
    };
    /* ##################################################################################################################### */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
};//end of gpEditCtrl