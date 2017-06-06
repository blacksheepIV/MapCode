/**
 * Created by blackSheep on 04-Jun-17.
 */
function usrInfoCtrl($scope,userService,$mdDialog){
     $scope.initUsr = function(){
         $scope.info = {};
         $scope.SendInvitation = false;
         $scope.info = userService.getUsrInfo();
         $scope.friendshipStatus = "";
         $scope.usrpoints = [];
         //console.log($scope.info); phone number if it has value
         switch ($scope.info.friendship){
             case 'no':
                 $scope.friendshipStatus = "دوست شما نیست";
                 $scope.SendInvitation = true;
                 break;
             case 'friend':
                 $scope.friendshipStatus = "دوست هستید";
                 break;
             case 'pending_to_me':
                 $scope.friendshipStatus = "درخواست دوستی فرستاده";
                 break;
             case 'pending_from_me':
                 $scope.friendshipStatus = "درخواست دوستی برایش فرستادید";
                 break;
         };
         if($scope.info.description === "" || $scope.info.description === null)
             $scope.info.description = "-ندارد-";
         if($scope.info.phone === "" || $scope.info.phone === null)
             $scope.info.phone = "-ندارد-";
     };//end of initUsr
    /* ################################################################################################################################################# */
    $scope.getUsrPoints = function(){
        var username = userService.getUsrInfo() .username;
        userService.GetPoints(username).then(
            function(data){
               $scope.usrpoints = data.data;
            },
            function(data){
                console.log(data);
            });
    };
    /* ################################################################################################################################################ */
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
};//end of usrInfoCtrl func
