/**
 * Created by blackSheep on 23-Apr-17.
 */
function pointService(){
    this.coordination = null;
    this.setLocation= function(lat,lang){
        console.log(lat);
        console.log(lang);
         coordination = {
            lat:lat,
            lng:lang
        };
    };
  this.getLocation = function(){
      return coordination;
  }
}//end of service
