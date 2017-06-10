/**
 * Created by blackSheep on 08-Jun-17.
 */
function groupService ($http){
    var group = {
         groupsList :{},
        getGroupsList : function(){
             var getGroups = window.apiHref+'groups';
             return $http({url:'getGroups',method:'GET'})
                 .success(function(data){
                     group.groupsList = data;
                 });
        }
    };
    return group;
};//end of groupeService
