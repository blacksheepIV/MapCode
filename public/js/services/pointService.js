/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointService(){
    var pointService = {
        coordination: null,
        categories:null,
        res:null,
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
        requestForCategory : function ($http) {
            var CatURL = window.apiHref + "point/categories";
            return $http.get(CatURL).success(function (data) {
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
        }
    };
    return pointService;
}//end of service
