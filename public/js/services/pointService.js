/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointService($http){
    var pointService = {
        coordination: null,
        categories:null,
        res:null,
        obtainedDetailedInfo : {},
        setLocation: function (lat, lang) {
            console.log(lat);
            console.log(lang);
            coordination = {
                lat: lat,
                lng: lang
            };
        },
        getLocation: function () {
            return coordination;
        },
        requestForCategory : function () {
            var CatURL = window.apiHref + "point/categories";
            return $http({
                url: CatURL,
                method: "GET"
            }).success(function (data) {
                pointService.categories = data;
            });
        },
        sendPointInfos : function(pointInfo){
            var pointUrl = window.apiHref + "point/";
           return $http({
                url: pointUrl,
                method: "POST",
                data: pointInfo
            }).success(function(data){
               pointService.res=data;
           });
        },
        getPointInfos : function () {
            var pointUrl = window.apiHref+"point/";
            return $http({
                url : pointUrl ,
                method: "GET"
            }).success(function(data){
                pointService.res = data;
            });
        },
        setDetailedInfo : function(detailedInfo){
            pointService.obtainedDetailedInfo = detailedInfo;
        },
        getDetailedInfo: function(){
            return pointService.obtainedDetailedInfo;
        }
    };
    return pointService;
}//end of service
