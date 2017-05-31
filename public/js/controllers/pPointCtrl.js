/**
 * Created by blackSheep on 16-May-17.
 */
function pPointCtrl ($scope , pointService ,sysMessagesService) {
   $scope.initPpoint = function(){
       $scope.namePattern = '[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
       var coord = pointService.getLocation();
       console.log(coord);
       $scope.pPoint = {
           name: "",
           lat: coord.lat,
           lng : coord.lat,
           description: ""
       };
   };//end of initPpoint
    $scope.addPpoint = function (){
        var personalPoint = {};
        var latitude= String($scope.pPoint.lat).substr(0, 10);
        var longitude = String($scope.pPoint.lng).substr(0, 11);
        personalPoint ={
            lat:latitude ,
            lng : longitude,
            name : $scope.pPoint.name
        };
        if(!$scope.addPersonalPoint.description.$pristine)
            personalPoint ={
                lat: latitude,
                lng : longitude,
                name : $scope.pPoint.name,
                description: $scope.pPoint.description
            };
        pointService.sendPpointInfo(personalPoint).then(
            function(pPointResult){
            console.log(pPointResult);
                sysMessagesService.showMsg("عرض تبریک","نقطه شخصی با موفقیت ثبت شد!","تشکر");
        }
        ,function(pPointResult){
            console.log(pPointResult);
        });
    };//end of addPpoint
};//end of pPointCtrl
