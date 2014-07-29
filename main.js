var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/blog');

var Post = mongoose.model('Post', {
  content: String,
  title: String,
  date: Date
});

app.get('/posts', function(req, res) {
  Post.find(function(e, result) {
    if (e) res.send(e);

    res.send(result);
  });
});

app.post('/posts', function(req, res) {
  var newPost = new Post(req.body);

  newPost.save(function(err, result) {
    res.status(200);
    res.end();
  });
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
