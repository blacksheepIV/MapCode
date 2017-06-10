/**
 * Created by blackSheep on 08-Jun-17.
 */
function groupService ($http){
    var group = {
         groupsList :{},
        deletionResult:{},
        getGroupsList : function(){
             var getGroups = window.apiHref+'groups/';
             return $http({url:getGroups,method:'GET'})
                 .success(function(data){
                     group.groupsList = data;
                 }).success(
                     function(data){
                         group.groupsList = data;
                     });
        },
        groupDeletion:function(name){
            var deletion = window.apiHref+'groups/'+name;
            return $http({url:deletion,method:"DELETE"})
                .success(function(data){
                    group.deletionResult = data;
                });
        }
    };
    return group;
};//end of groupeService
