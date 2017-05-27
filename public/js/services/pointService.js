/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointService($http){
    var pointService = {
        coordination: null,
        categories:null,
        res:null,
        obtainedDetailedInfo : {},
        searchResult : {},
        searchedFor : null,
        pPointResult : {},
        pPointDetailedInfo : {},
        sharedPoint : {},
        setLocation: function (lat, lang) {
          //  console.log(lat);
         //   console.log(lang);
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
        },
        showSearchResult : function(searchParams){
            var searchUrl = window.apiHref+"/point/search";
            var myConfig = {};
            myConfig= searchParams;
            console.log(myConfig);
           return $http({url:searchUrl,method:"GET",params : myConfig})
                .success(function(data){
                    pointService.searchResult = data;
                });
        },
        setSearchedValue : function(val){
            pointService.searchedFor = val;
            console.log(pointService.searchedFor);
        },
        getSearchedValue : function(){
            return pointService.searchedFor;
        },
        sendPpointInfo : function (pPoint) {
            var pPointUrl = window.apiHref+'personal_points';
            return $http({url:pPointUrl,method:"POST",data:pPoint})
                .success(function(data){
                    pointService.pPointResult  = data;
                });
        },
        getPpointInfo : function(){
            var pPointGet = window.apiHref + 'personal_points' ;
            return $http({url:pPointGet,method:"GET"}).success(
                function(data){
                    pointService.pPointResult = data;
                }
            );
        },
        setPpointDetailedInfo : function(pPoint){
            pointService.pPointDetailedInfo = pPoint;
        },
        getPpointDetailedInfo : function(){
          return  pointService.pPointDetailedInfo;
        },
        sharePoint : function(point){
            pointService.sharedPoint = point;
        },
        getSharedPoint : function(){
            return pointService.sharedPoint;
        }
    };
    return pointService;
};//end of service
