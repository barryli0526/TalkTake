/**
 * Created with JetBrains WebStorm.
 * User: bli111
 * Date: 9/15/14
 * Time: 11:59 AM
 * To change this template use File | Settings | File Templates.
 */


/**
 * 通过当前两个用户之间的关系以及下一条操作来获取进阶下来的用户关系
 * @param currentRelation
 * @param operation
 * @returns {number}
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