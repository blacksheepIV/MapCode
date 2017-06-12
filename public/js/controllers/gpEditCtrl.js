/**
 * Created by blackSheep on 12-Jun-17.
 */
function gpEditCtrl ($scope,groupService,$mdDialog){
    $scope.initEdit = function(){
        $scope.addedFriend = "";
        $scope.gpInfo = groupService.getSharedInfo();
        $scope.gpName = $scope.gpInfo.name;
        $scope.friendList = $scope.gpInfo.friends;
    };
    /* ##################################################################################################################### */
    $scope.submit = function(){
        var newGroup={};
        angular.forEach($scope.editGroup, function(value, key) {
            if(key[0] == '$') return;
            // console.log(key, value.$pristine);
            if(!value.$pristine){
                console.log(key);
                newGroup[key] = value.$modelValue;
            }
        });
        console.log(newGroup);
        groupService.updateGroup($scope.gpInfo.name,newGroup).then(
            function(updateResult){
                console.log(updateResult);
            }
            ,function(updateResult){
                console.log(updateResult);
            });
    };
    /* ##################################################################################################################### */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
};//end of gpEditCtrl