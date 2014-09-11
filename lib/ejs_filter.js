var ejs = require('ejs');

ejs.filters.compareId = function(id1, id2){
  return (id1.toString() === id2.toString());
}