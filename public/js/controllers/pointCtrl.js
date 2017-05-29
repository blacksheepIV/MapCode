/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointCtrl ($scope,pointService,$mdDialog,$http,$location,$rootScope,localStorageService) {
    $scope.initPoint = function () {
       // $scope.pointNames = ['point1', 'point2', 'point3', 'point4', 'point5', 'point6', 'point7', 'point8', 'point9', 'point10'];
        $scope.index = 0;
        $scope.HeadCat = "";
        $scope.subcats = [];
        $scope.namePattern = '[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\u200C\u200F ]+';
        $scope.provinces = [
            {id: 1, name: 'اصفهان'},
            {id: 2, name: 'تهران'}
        ];
        $scope.PresentableCities = [];
        $scope.cities = [
            {prov: 'اصفهان', name: 'اصفهان'},
            {prov: 'اصفهان', name: 'اردستان'},
            {prov: 'اصفهان', name: 'شهرضا'},
            {prov: 'اصفهان', name: 'فولادشهر'},
            {prov: 'اصفهان', name: 'کاشان'},
            {prov: 'اصفهان', name: 'آران و بیدگل'},
            {prov: 'تهران', name: 'آبعلی'},
            {prov: 'تهران', name: 'تهران'},
            {prov: 'تهران', name: 'دماوند'},
            {prov: 'تهران', name: 'شمیرانات'},
            {prov: 'تهران', name: 'فشم'},
            {prov: 'تهران', name: 'ورامین'}
        ]; //TODO:change it to input
        var coord = pointService.getLocation();
        console.log(coord);
        $scope.point = {
            name: '',
            lat: coord.lat,
            lng: coord.lng,
            name: "",
            phone: null,
            province: "",
            city: "",
            address: "",
            public: -1,
            category: "",
            description: "",
            tags: []
        };
        pointService.requestForCategory().then(
            function (categories) {
                console.log(categories);
                $scope.cats = categories.data;
                //console.log($scope.point.category);
            }, function (categories) {
                console.log(categories); //in case of failure
            });
    }; //end initPoint
    //******************************************************************************************************************
    $scope.$watch('point.province',function (newValue, oldValue, scope) {
        $scope.PresentableCities = [];// to fix appending issue on parameter;s value change
        angular.forEach($scope.cities ,function(value,key){
            if(value.prov === newValue.name){
                $scope.PresentableCities.push(value.name);
            }
        });
    },false);
    //******************************************************************************************************************
    $scope.$watch('HeadCat',function (newValue, oldValue, scope) {
            $scope.subcats = []; // to fix appending issue on parameter;s value change
            angular.forEach($scope.cats, function(value, key) {
                if(key === newValue ) {
                    angular.forEach(value, function (value2, key2) {
                        $scope.subcats.push(value2.name);
                    });
                }
            });
        },false
        );
    //******************************************************************************************************************
    $scope.showSucces = function () {
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
    $scope.submit = function () {
        console.log('data Was sent');
        var latitude = String($scope.point.lat).substr(0, 10);
        var longitude = String($scope.point.lng).substr(0, 11);
        if($scope.addPoint.description.$pristine && $scope.addPoint.tags.$pristine ) {
            var pointInfo = {
                lat: latitude,
                lng: longitude,
                name: $scope.point.name,
                phone: $scope.point.phone,
                province: $scope.point.province.name,
                city: $scope.point.city,
                address: $scope.point.address,
                public: parseInt($scope.point.public),
                category: $scope.point.category
            }; // data to be sent
        }
        else if(!$scope.addPoint.description.$pristine && $scope.addPoint.tags.$pristine ) {
            var pointInfo = {
                lat: latitude,
                lng: longitude,
                name: $scope.point.name,
                phone: $scope.point.phone,
                province: $scope.point.province.name,
                city: $scope.point.city,
                address: $scope.point.address,
                public: parseInt($scope.point.public),
                category: $scope.point.category,
                description : $scope.point.description
            }; // data to be sent
        }
        else if($scope.addPoint.description.$pristine && !$scope.addPoint.tags.$pristine ){
            var pointInfo = {
                lat: latitude,
                lng: longitude,
                name: $scope.point.name,
                phone: $scope.point.phone,
                province: $scope.point.province.name,
                city: $scope.point.city,
                address: $scope.point.address,
                public: parseInt($scope.point.public),
                category: $scope.point.category,
                tags : $scope.point.tags
            }; // data to be sent
        }
        else if(!$scope.addPoint.description.$pristine && !$scope.addPoint.tags.$pristine ){
            var pointInfo = {
                lat: latitude,
                lng: longitude,
                name: $scope.point.name,
                phone: $scope.point.phone,
                province: $scope.point.province.name,
                city: $scope.point.city,
                address: $scope.point.address,
                public: parseInt($scope.point.public),
                category: $scope.point.category,
                description : $scope.point.description,
                tags : $scope.point.tags
            }; // data to be sent
        }
            pointService.sendPointInfos(pointInfo).then(function(res){
            console.log(res);
            $mdDialog.hide();
            $scope.showSucces();
            if(localStorageService.isSupported) {
                localStorageService.set('point1', pointInfo);
            }

            },function(res){
                console.log(res);
        });
    };
    $scope.cancel = function () {
        $mdDialog.cancel();
    };
}
