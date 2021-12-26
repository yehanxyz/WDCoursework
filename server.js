require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");

mongoose.connect("mongodb+srv://admin-wd:sandinu123@cluster0.kihxv.mongodb.net/betaList", {useNewUrlParser: true});

const newsletterSchema = new mongoose.Schema ({
  email:String
});

const userSchema = new mongoose.Schema ({
  name:String,
  email:String,
  password:String
});

const postSchema = new mongoose.Schema({
  id:String,
  img:String,
  title:String,
  fronttext:String,
  content:String,
  websitelink:String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

const NewsletterUser = mongoose.model("newsletterEmail", newsletterSchema);
const User = mongoose.model("user",userSchema);
const Post = mongoose.model("post",postSchema);

var postIDs = [];
var titles = [];
var imgs = [];
var fronttexts = [];

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("/",function(req,res) {
  postIDs = [];
  titles = [];
  imgs = [];
  fronttexts = [];


  Post.find(function(err,posts) {
    if(err){
      console.log(err);
    } else {
      posts.forEach(function(post) {
        // console.log(post.title);
        titles.push(post.title);
        imgs.push(post.img);
        fronttexts.push(post.fronttext);
        postIDs.push(post.id);

      })
      // console.log(titles.length);
        res.render("frontpage", {titles:titles, imgs:imgs, fronttexts:fronttexts, postids:postIDs});
      }
    });

});

// SIGN IN & SIGN UP

app.get("/signin",function(req,res){
  res.sendFile(__dirname + "/signin.html");
});

app.post("/signin",function (req,res) {
  const userEmail = req.body.UserEmail;
  const password = req.body.password;

  User.findOne({email:userEmail}, function(err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.redirect("/addpost");
        }
      }
    }
  });
});

app.get("/signup",function(req,res){
  res.sendFile(__dirname + "/signup.html");
});

app.post("/signup",function(req,res){
  let fname = req.body.fname;
  let lname = req.body.lname;
  let userEmail = req.body.email;
  let password = req.body.password;
  let confirmPassword = req.body.confirmPassword;
  if (fname.length != 0 && lname.length != 0 && userEmail.length != 0 && password.length != 0 && confirmPassword.length != 0) {
    if (password === confirmPassword) {
       const user = new User({
        name:fname +" "+ lname,
        email:userEmail,
        password:password
      });

      user.save(function(err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/signin");
        }
      });

    }
  }
});



// NEWSLETTER

app.get("/newsletter",function(req,res) {
  res.render("newsletter");
});

app.post("/newsletter",function(req,res) {
  console.log(req.body.newsletterEmail);
  const newsletterUser = new NewsletterUser ({
    email:req.body.newsletterEmail
  });

  newsletterUser.save();
  console.log("Saved");
  res.render("newslettersuccess");

});

app.get("/addpost",function(req,res) {
  res.sendFile(__dirname + "/addpost.html");
});

app.post("/addpost",function(req,res) {
  console.log(req.body.id);
  const post = new Post ({
    id:req.body.id,
    img:req.body.imglink,
    title:req.body.title,
    fronttext:req.body.front,
    content:req.body.content,
    websitelink:req.body.websitelink
  });

console.log("saved");
  post.save();
  res.redirect("/addpost");

});


app.get("/posts/:postId", function(req,res) {
  console.log(req.params.postId);
  var postid = req.params.postId;


    Post.find(function(err,posts) {
      if(err){
        console.log(err);
      } else {
        posts.forEach(function(post) {
        if (postid === post.id) {
          res.render("post",{titleHead:post.title, imglink:post.img,smallText:post.fronttext,largeText:post.content,website:post.websitelink});
        }

        })
        }
      });

});


app.listen(process.env.PORT || 3000, function() {
  console.log("Server has started successfully");
});
