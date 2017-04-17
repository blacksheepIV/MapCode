/**
 * Created by blackSheep on 17-Apr-17.
 */
var date = function($filter){
    return function(input)
    {
        if(input == null){ return ""; }

        var _date = $filter('date')(new Date(input), 'yyyy-MM-dd');

        return _date.toUpperCase();

    };
}