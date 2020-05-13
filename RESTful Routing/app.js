var bodyParser 	= require("body-parser"),
methodoverride 	= require("method-override"),
expressSanitizer = require("express-sanitizer"),
express 		= require("express"),
mongoose 		= require("mongoose"),
app 			= express();

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});  // connect to mongodb
app.set("view engine", "ejs");
app.use(express.static("public"));  // serve custom style sheet
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());  // must be placed after bodyParser
app.use(methodoverride("_method"))  // tells method-override what to look for in req

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}  // sets default type to date and uses current date
});
var Blog = mongoose.model("Blog", blogSchema);


// RESTFUL ROUTES

app.get("/", function(req, res){
	res.redirect("/blogs")  // redirects to /blogs
});

// INDEX ROUTE
app.get("/blogs", function(req, res) {
	Blog.find({}, function(err, blogs){
		if(err) {
			console.log(err);
		} else {
			res.render("index", {blogs: blogs});
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
	// create blogs
	req.body.blog.body = req.sanitize(req.body.blog.body);  // sanitizes blog body input
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		} else {
			// redirect to index
			res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});
		}
	})
});


// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	// searches for existing blog content and posts in edit form
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);  // sanitizes blog body input
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);  // redirects back to show blog page
		}
	})
});

// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	})
	// redirect somewhere
});

// USE THIS FOR GOORM
app.listen(3000, () => {
	console.log("The server has started.");
});