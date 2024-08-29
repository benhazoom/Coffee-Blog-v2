//General Knowladge
//In the callback functions,
// 'res' stands for response which is what will send to the client from the server 
// 'req' stands for request  which is what will send to the client from the server 
// in middlewere we want to add 'next' to the callback parameters to not stop the processing 
// we can use 3rd party middlewere like 'morgan' beeing installed via npm 

//Require section - npm modules, db collections and etc
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const morgan = require('morgan');
const Blog = require('./models/blog');
// our Nodejs app will be of express type
const app = express();


async function connectDB(Uri) {
  try {
    const conn = await mongoose.connect(Uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
connectDB(process.env.DATABASE_URI);


// register view engine as ejs
app.set('view engine', 'ejs');

// express middlewares  
app.use(express.static('public'));//enabling us to access static files from the specified dir
app.use(express.urlencoded({extended: true}));//parsses url to data object to use put

//3rd party middlewere - morgan - clging us status of each request this will fire up fo each request and will not stop the processing
app.use(morgan('dev'));//using morgen with the dev option


// <--------------------------------------------REQUESTS-------------------------------------------------->
// mongoose & mongo requests
app.get('/add-blog', (req, res) => {
  //creating a new instance of blog
    const blog = new Blog({
      title: 'newBlog2',
      snippet:'1',
      body:'body'
    });
  //saving it to the DB with async method
  blog.save()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

//get all
app.get('/all-blogs', (req, res) => {
  Blog.find()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

//get by id
app.get('/first-blog', (req, res) => {
  Blog.findById('63a856d960c05406649858ec')
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      console.log(err);
    });
});

//redirecting to /blogs
app.get('/', (req, res) => {
  res.redirect('/blogs');
});


//Post method - creates a new blog and redirecting to home page uppon success
app.post('/blogs',(req,res) =>{
  const nblog = Blog (req.body);//passing the data from the middleware express.urlencoded to make new blog instance
  nblog.save()
  .then((result)=>{
    res.redirect('/blogs');
  })
  .catch((err)=>{
  console.log(err);
  });
});



//<-------------------------------------------------Renders-------------------------------------------------->
//rendering about.ejs
app.get('/about', (req, res) => {
  //render accepts ejs file as 1st param and object to use its data for 2nd param
  res.render('about', { title: 'About' });
});

//rendering create.ejs
app.get('/blogs/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

//at blogs page render all blogs from DB
app.get('/blogs', (req, res) => {
  Blog.find().sort({ createdAt: -1 }) //sorting from newest to oldest using timestamps
    .then(result => {
      res.render('index', { blogs: result, title: 'All blogs' });
    })
    .catch(err => {
      console.log(err);
    });
});
//getting specific blog
app.get('/blogs/:id',(req,res) =>{
  Blog.findById(req.params.id)
  .then(result => {
    res.render('details',{blog: result,title: 'Blog Details'});
  })
  .catch(err => {
    console.log(err);
  });
});

//deletting specific blog
app.delete('/blogs/:id',(req,res) =>{
  Blog.findByIdAndDelete(req.params.id)
  .then(result => {
    res.json({redirect: '/blogs'});
  })
  .catch(err => {
    console.log(err);
  });
});

//rendering 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
