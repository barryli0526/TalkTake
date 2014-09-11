var path = require('path'),
    fs = require('fs');

exports.Index = function(req, res){
  res.render('demo/html5/index.html',{
    layout:null
  })
//  res.render('demo/WebForm1.html',{
//    layout:null
//  }
//  )
}
