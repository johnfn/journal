var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog');

var Post = mongoose.model('Post', {
  content: String,
  title: String,
  date: Date
});

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);


var db = mongoose.connection;
db.on('open', function() { 
  console.log("open");

  var newPost = new Post({
    content: "This is a post.",
    title: "some title.",
    date: new Date()
  });

  /*
  newPost.save(function(err, result) {
    console.log(result);
  });
 */

  Post.find(function(e, result) {
    console.log(result);
  });

  //console.log(Post.find());
});
