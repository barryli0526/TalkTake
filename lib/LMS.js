/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/15/14
 * Time: 11:59 AM
 * To change this template use File | Settings | File Templates.
 */


exports.analyzeRelation = function(currentRelation, operation){
    var newRelation = 0;
    if(operation == 'f'){
        if(currentRelation == 0){
            newRelation = 2;
        }else if(currentRelation == 1){
            newRelation = 3;
        }else{
            newRelation = currentRelation;
        }
    }else if(operation == 'uf'){
        if(currentRelation == 2){
            newRelation = 0;
        }else if(currentRelation == 3 || currentRelation == 4){
            newRelation = 1;
        }
    }else if(operation == 'bf'){
        if(currentRelation == 0){
            newRelation = 1;
        }else if(currentRelation == 2){
            newRelation = 3;
        }else{
            newRelation = currentRelation;
        }
    }
    else if(operation == 'buf'){
        if(currentRelation == 1){
            newRelation = 0;
        }else if(currentRelation == 3 || currentRelation == 4){
            newRelation = 2;
        }else{
            newRelation = currentRelation;
        }
    }
    return newRelation;
}