/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointCtrl ($scope,pointService,$mdDialog,$http,$location,$rootScope,localStorageService){
    $scope.initPoint = function(){
        $scope.pointNames=['point1','point2','point3','point4','point5','point6','point7','point8','point9','point10'];
        $scope.index = 0;
        $scope.namePattern='[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
        $scope.provinces =[
            {id:1 , name:'اصفهان'},
            {id:2 , name:'تهران'}
        ];
        $scope.cities=[
            {prov:'اصفهان',name:'اصفهان'},
            {prov:'اصفهان',name:'اردستان'},
            {prov:'اصفهان',name:'شهرضا'},
            {prov:'اصفهان',name:'فولادشهر'},
            {prov:'اصفهان',name:'کاشان'},
            {prov:'اصفهان',name:'آران و بیدگل'},
            {prov:'اصفهان',name:'فولادشهر'},
            {prov:'اصفهان',name:'آبعلی'},
            {prov:'اصفهان',name:'تهران'},
            {prov:'اصفهان',name:'دماوند'},
            {prov:'اصفهان',name:'شمیرانات'},
            {prov:'اصفهان',name:'فشم'},
            {prov:'اصفهان',name:'ورامین'}
        ];
        var coord = pointService.getLocation();
        console.log(coord);
        $scope.point={
            name:'',
            lat:coord.lat,
            lng:coord.lng,
            name:"",
            phone:null,
            province:"",
            city:"",
            address:"",
            public:-1
        };
    };
    //******************************************************************************************************************
    $scope.showSucces = function() {
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('تبریک')
                .textContent('ثبت نقطه با موفقیت انجام شد!')
                .ariaLabel('successDialog')
                .ok('مرسی')
        );
    };
    //*****************************************************************************************************************
    $scope.submit=function(){
        console.log('data Was sent');
        var latitude= String($scope.point.lat).substr(0, 10);
        console.log(latitude);
        var langitude= String($scope.point.lng).substr(0, 11);
        console.log(langitude);
       var pointInfo={
            lat:latitude ,
            lng:langitude ,
            name: $scope.point.name,
            phone: $scope.point.phone,
            province: $scope.point.province.name,
            city: $scope.point.city.name,
            address: $scope.point.address,
            public: parseInt($scope.point.public)
        }; // data to be sent
        var pointUrl = window.apiHref+"point/";
        $http({
            url : pointUrl ,
            method: "POST" ,
            data : pointInfo
        }).then(
            function(response){
                console.log(response);
                $mdDialog.hide();
                $scope.showSucces();
                if(localStorageService.isSupported) {
                    localStorageService.set('point1',pointInfo);
                   // $scope.index++;
                }
            },
            function(response){
                console.log(response); //failure
            }
        );
    };
    $scope.cancel=function () {
        $mdDialog.cancel();
    }
}
