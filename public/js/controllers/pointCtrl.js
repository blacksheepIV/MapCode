/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointCtrl ($scope,pointService){
    $scope.initPoint = function(){
        $scope.provinces =[
            {id:1 , name:'اصفهان'},
            {id:2 , name:'تهران'}
        ];
        $scope.cities=[
            {pro:'اصفهان',name:'اصفهان'},
            {pro:'اصفهان',name:'اردستان'},
            {pro:'اصفهان',name:'شهرضا'},
            {pro:'اصفهان',name:'فولادشهر'},
            {pro:'اصفهان',name:'کاشان'},
            {pro:'اصفهان',name:'آران و بیدگل'},
            {pro:'اصفهان',name:'فولادشهر'},
            {pro:'اصفهان',name:'آبعلی'},
            {pro:'اصفهان',name:'تهران'},
            {pro:'اصفهان',name:'دماوند'},
            {pro:'اصفهان',name:'شمیرانات'},
            {pro:'اصفهان',name:'فشم'},
            {pro:'اصفهان',name:'ورامین'}
        ];
        var coord = pointService.getLocation();
        console.log(coord);
        $scope.point={
            name:'',
            lat:coord.lat,
            lng:coord.lng,

        };
    };
}
