/**
 * Created by blackSheep on 02-May-17.
 */
function testUser (){
    var u = null;
    this.getUserInfo = function(user){
        u = user;
        console.log(u);
    };

};