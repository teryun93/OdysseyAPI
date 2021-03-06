// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
//var relationship = require("mongoose-relationship");
var Bear     = require('./app/models/bear');
var User     = require('./app/models/user');
var Board     = require('./app/models/board');
var Task     = require('./app/models/task');
var Comment     = require('./app/models/comment');

mongoose.connect('mongodb://bob:1@ds023468.mlab.com:23468/odyssey', function(err, res) {
    console.log("mongoose connected");
    if (err) throw err;
    //console.error(err.stack);
}); // connect to our database


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



var port = process.env.PORT || 9999;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});


// User API Calls


router.route('/users/')

    // create a user (accessed at POST http://localhost:8080/api/users)
    .post(function(req, res) {

        var user = new User();      // create a new instance of the User model
        user.username = req.body.username;  // set the username (comes from the request)
        user.password = req.body.password;  // set the password (comes from the request)
        
        User.findOne({username : user.username}, function(err, existingUser) {

            if(err) {
                res.send(err);
            }

            // check if the user already exists or not
            if(existingUser) {
                res.json("user already exist");
            } else {
                // save the user and check for errors
                user.save(function(err, user) {
                    if (err)
                        res.send(err);

                    res.json(user);
                });
            }

        });        

    })
    // get all users (accessed at GET http://localhost:8080/api/users)
    .get(function(req, res) { 

        User.find(function(err, users) {
            if (err) {
                res.send(err);
            } else {
                res.send("callback(" + JSON.stringify(users) + ")");
            }
        });

    });

router.route('/users/:username/:password')

    // find user by username and password (accessed at GET http://localhost:8080/api/users/:username/:password)
    .get(function(req, res) {

        username = req.params.username;
        password = req.params.password;

        User.findOne({username, password}, function(err, user) {
            //Do your action here..
            if(err)
                res.send(err);

                res.send(user);
        });
    });

    // {"_id":"56ee25df8a4d7505bc851ba7","password":"1","username":"joe","__v":0} <-- FOR TEST PURPOSES


router.route('/users/:user_id')

    // get the user with that id (accessed at GET http://localhost:8080/api/users/:user_id)
    .get(function(req, res) {
        User.findById(req.params.user_id, function(err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })
    //update the user with that id (accessed at PUT http://localhost:8080/api/users/:user_id)
   .put(function(req, res) {

        // use our bear model to find the bear we want
        User.findById(req.params.user_id, function(err, user) {

            if (err)
                res.send(err);

            user.username = req.body.username;
            user.password = req.body.password;
            user.role = req.body.role;
            // save the user
            user.save(function(err, user) {
                if (err)
                    res.send(err);
                console.log("updated");
                res.json(user);
            });

        });
    })
    //delete the user with that id (accessed at DELETE http://localhost:8080/api/users/:user_id)
    .delete(function(req, res) {
        User.remove({
            _id: req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted', user: user });
        });
    });
/****/


// Boards API Calls
router.route('/boards/')

    // create a board (accessed at POST http://localhost:8080/api/boards)
    .post(function(req, res) {

        var board = new Board();      // create a new instance of the Board model
        board.title = req.body.title;  // set the title (comes from the request)
        board.description = req.body.description;  // set the description (comes from the request)
        board.creator = req.body.creatorId; // set the id of user creating the board (comes from the request)

        // check if the board already exists or not
        Board.findOne({title : board.title}, function(err, existingBoard) {

            if(err) {
                res.send(err);
            }

            if(existingBoard) {
                res.json("board already exists");
            } else {
                // save the user and check for errors
                board.save(function(err, board) {
                    if (err)
                        res.send(err);
                    res.json(board);
                });
            }

        });        

    })
    // get all boards (accessed at GET http://localhost:8080/api/boards)
    .get(function(req, res) { 

        Board.find().populate('creator').exec(function(error, boards) {
            res.json(boards);
        })

    });

router.route('/boards/:board_id')

    // get the board with that id (accessed at GET http://localhost:8080/api/boards/:board_id)
    .get(function(req, res) {

        Board.findById(req.params.board_id, function(err, board) {
            if (err)
                res.send(err);
            res.json(board);
        });

    })
    //update the board with that id (accessed at PUT http://localhost:8080/api/boards/:board_id)
   .put(function(req, res) {

        // use our board model to find the board we want
        Board.findById(req.params.board_id, function(err, board) {

            if (err)
                res.send(err);

            board.title = req.body.title;
            board.description = req.body.description;
            board.userId = req.body.userId;
            // save the user
            board.save(function(err, board) {
               
                if (err)
                    res.send(err);
                console.log("updated");
                res.json(board);

            });

        });
    })
    //delete the board with that id (accessed at DELETE http://localhost:8080/api/boards/:board_id)
    .delete(function(req, res) {
        Board.remove({
            _id: req.params.board_id
        }, function(err, board) {
            
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted', board: board });

        });
    });

router.route('/boards/user/:user_id')

    // get the board with user_id (accessed at GET http://localhost:8080/api/boards/:user_id)
    .get(function(req, res) {

        Board.find({ 'userId' :  req.params.user_id}, function(err, board) {
            if (err)
                res.send(err);

            console.log("found by user id");
            res.json(board);
        });

    });
/****/

//searching when on a board page 


router.route('/board/:board_id/search/task_title')
    
    // get a task that matches title
    .get(function(req, res){
        Task.find({
            "title" : { "$regex" : req.query.q, "$options" : "i" }, 
            "board" : req.params.board_id },
        function(err, tasks){
            res.json(tasks);
        });
    });

router.route('/board/:board_id/search/task_description')

    // get a task that matches description
    .get(function(req, res){
        Task.find({
            "description" : { "$regex" : req.query.q, "$options" : "i"}, 
            "board" : req.params.board_id },
            function(err, tasks){
                res.json(tasks);
             });
        });

router.route('/board/:board_id/search/task_priority')

    // get a task that matches priority
    .get(function(req, res){
        Task.find({
            "priority" : { "$regex" : req.query.q, "$options" : "i"}, 
            "board" : req.params.board_id },
            function(err, tasks){
                res.json(tasks);
            });
        });

router.route('/board/:board_id/search/task_due_date')

    .get(function(req, res){
        Task.find({
            "due_date": {"$eq": new Date(parseInt(req.query.year), parseInt(req.query.month), parseInt(req.query.day))}, 
            "board" : req.params.board_id },
            function(err, tasks){
                res.json(tasks);
            });
    });

// ask for all tasks have due_dates 
//that are BEFORE today's date. 
//We use today's date because specifying 
//a different due date has no relevance

router.route('/board/:board_id/search/task_past_due')

    .get(function(req, res){
        Task.find({
            "due_date": {"$lt": new Date() }, 
            "board" : req.params.board_id },
            function(err, tasks){
                res.json(tasks);
            });
    });

//searching for an creator
//regex doesnt work, only returns 
//when username is perfect match
router.route('/board/:board_id/search/task_creator')

    .get(function(req, res){
        User.find({
            "username" : { "$regex" : req.query.q, "$options" : "i"}, 
            "board" : req.params.board_id }, 
            function(req, users){
                Task.find({
                    "creator" : users[0]._id}, 
                    function(err, tasks){
                        res.json(tasks);
            });

        });
    
    });

//searching for an assignee
//regex doesnt work, only returns 
//when username is perfect match
router.route('/board/:board_id/search/task_assignee')

    .get(function(req, res){
        User.find({
            "username" : { "$regex" : req.query.q, "$options" : "i"}, 
            "board" : req.params.board_id }, 
            function(req, users){
                Task.find({
                    "creator" : users[0]._id}, 
                    function(err, tasks){
                        res.json(tasks);
            });

        });
    
    });



// Tasks API Calls
router.route('/tasks/')

    // create a task (accessed at POST http://localhost:8080/api/tasks)
    .post(function(req, res) {

        var task = new Task();      // create a new instance of the Task model
        task.title = req.body.title;  // set the title (comes from the request)
        task.description = req.body.description;  // set the description (comes from the request)
        task.creator = req.body.creatorId; // set the id of user creating the task (comes from the request)
        task.board = req.body.boardId // set the id of the board that the task is in (comes from the request)
        task.assignee = req.body.assigneeId // set the id of the assignee

        // check if the task already exists or not
        Task.findOne({title : task.title}, function(err, existingTask) {

            if(err) {
                res.send(err);
            }

            if(existingTask) {
                res.json("task already exists");
            } else {
                // save the task and check for errors
                task.save(function(err, task) {
                    if (err)
                        res.send(err);
                    
                    // store saved task temporarily to return it later
                    var task = task;
                    var board = new Board(); // create a new instance of the Board model
                    // find the board that it is assigned to
                    Board.findById(task.board).populate('creator').populate('tasks').exec(function(error, board) {
                        if(error)
                            res.json(error);
                        // add the new task to the board that it belongs to and save
                        console.log(board);
                        board.tasks.push(task._id);
                        board.save(function(err, board) {
                            res.json(task);
                        });
                    });

                });
            }

        });        

    })
    // get all tasks (accessed at GET http://localhost:8080/api/tasks)
    .get(function(req, res) { 

        Task.find().populate('creator').populate('board').populate('assignee').populate('comments').exec(function(error, tasks) {
            res.json(tasks);
        })

    });


// FILTERING -> get the tasks that match a given search term (accessed at GET http://localhost:8080/api/tasks/search/title)

router.route('/tasks/search/title')
    
    // get a task that matches title
    .get(function(req, res){
        Task.find({
            "title" : { "$regex" : req.query.q, "$options" : "i" }},
        function(err, tasks){
            res.json(tasks);
        });
    });

router.route('/tasks/search/description')

    // get a task that matches description
    .get(function(req, res){
        Task.find({
            "description" : { "$regex" : req.query.q, "$options" : "i"}},
            function(err, tasks){
                res.json(tasks);
             });
        });

router.route('/tasks/search/priority')

    // get a task that matches priority
    .get(function(req, res){
        Task.find({
            "priority" : { "$regex" : req.query.q, "$options" : "i"}},
            function(err, tasks){
                res.json(tasks);
            });
        });

router.route('/tasks/search/due_date')

    .get(function(req, res){
        Task.find({
            "due_date": {"$eq": new Date(parseInt(req.query.year), parseInt(req.query.month), parseInt(req.query.day))}},
            function(err, tasks){
                res.json(tasks);
            });
    });

// ask for all tasks have due_dates 
//that are BEFORE today's date. 
//We use today's date because specifying 
//a different due date has no relevance

router.route('/tasks/search/past_due')

    .get(function(req, res){
        Task.find({
            "due_date": {"$lt": new Date() }},
            function(err, tasks){
                res.json(tasks);
            });
    });

//searching for an creator
//regex doesnt work, only returns 
//when username is perfect match
router.route('/tasks/search/creator')

    .get(function(req, res){
        User.find({
            "username" : { "$regex" : req.query.q, "$options" : "i"}}, 
            function(req, users){
                Task.find({
                    "creator" : users[0]._id}, 
                    function(err, tasks){
                        res.json(tasks);
            });

        });
    
    });

//searching for an assignee
//regex doesnt work, only returns 
//when username is perfect match
router.route('/tasks/search/assignee')

    .get(function(req, res){
        User.find({
            "username" : { "$regex" : req.query.q, "$options" : "i"}}, 
            function(req, users){
                Task.find({
                    "creator" : users[0]._id}, 
                    function(err, tasks){
                        res.json(tasks);
            });

        });
    
    });



//step one of searching for users (Tom's suggestion)
router.route('/tasks/search/all_users')

    .get(function(req, res){
        User.find(function(req, users){
            res.json(users);
        });
    });


//step four of searching for users (Tom's suggestion)
router.route('/tasks/search/:user_id')
    
    .get(function(req, res){
        User.find({"_id" : req.params.user_id}, function(req, users){
            res.json(users);
        });

    });

//search for tasks with a given board name
router.route('/tasks/search/board')

    .get(function(req, res){
        Board.find({
            "title" : { "$regex" : req.query.q, "$options" : "i"}}, 
            function(req, boards){
                Task.find({
                    "board" : boards[0]._id}, 
                    function(err, tasks){
                        res.json(tasks);
            });

        });
    
    });



router.route('/tasks/:task_id')

    // get the task with that id (accessed at GET http://localhost:8080/api/tasks/:task_id)
    .get(function(req, res) {
        Task.findById(req.params.task_id).populate('creator').populate('board').populate('assignee').populate('comments').exec(function(error, task) {
            if(error)
                res.json(error);
            Task.populate(task.comments, 'creator', function(err, comments){
                // this grabs all the comments associated with the task
                res.json(task);
            });

            //res.json(task);
        });
    })
    // update the task with that id (accessed at PUT http://localhost:8080/api/tasks/:task_id)
   .put(function(req, res) {

        // use our task model to find the task we want
        Task.findById(req.params.task_id, function(err, task) {

            if (err)
                res.send(err);

            // update the task
            task.title = req.body.title;
            task.description = req.body.description;
            task.priority = req.body.priority;
            task.workflow = req.body.workflow;
            task.assignee = req.body.assigneeId;
            // save the task
            task.save(function(error, tasks) {
                if (err)
                    res.send(err);

                res.json(task);
            });

        });
    })
    // delete the task with that id (accessed at DELETE http://localhost:8080/api/tasks/:task_id)
    .delete(function(req, res) {
        Task.remove({
            _id: req.params.task_id
        }, function(err, task) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted', task: task });
        });
    });
/****/

// Comments API Calls
router.route('/comments/')

    // create a comment(accessed at POST http://localhost:8080/api/comments)
    .post(function(req, res) {

        var comment= new Comment();      // create a new instance of the Comment model
        comment.comment = req.body.comment;  // set the comment (comes from the request)
        //comment.date = req.body.date;  // set the date(comes from the request)
        comment.creator = req.body.creatorId; // set the id of user creating the comment (comes from the request)
        comment.task = req.body.taskId; // set the id of task of the comment (comes from the request)
        
        var taskId = comment.task // temporarily store associated task ID

        // save the comment and check for errors
        comment.save(function(err, comment) {
            if (err)
                res.send(err);
                
            Task.findById(taskId).populate('creator').populate('board').populate('assignee').populate('comments').exec(function(error, task) {
                if(error)
                    res.json(error);

                // add the new comment to the task that it belongs to and save
                console.log(task);
                task.comments.push(comment._id);
                task.save(function(err, task) {
                    if(err)
                        res.json(err);

                    console.log("task : ");
                    console.log(task);


                    res.json(comment);

                });
            });            
            //res.json(comment);
        });       

    })
    // get all comments (accessed at GET http://localhost:8080/api/comments)
    .get(function(req, res) { 
        /*
        Board.find().populate('creator').exec(function(error, boards) {
            res.json(boards);
        })
        */

    });

/****/





router.route('/bears')
    // create a bear (accessed at POST http://localhost:8080/api/bears)
    .post(function(req, res) {

        var bear = new Bear();      // create a new instance of the Bear model
        //console.log(req.params.bear_name);
        console.log(req.body);
        bear.name = String(req.body.name);  // set the bears name (comes from the request)
        // save the bear and check for errors
        bear.save(function(err , bear) {
            if (err)
                res.send(err);
            res.json({ message: 'Bear created!' + bear});
        });
        
    })
    // get all the bears (accessed at GET http://localhost:8080/api/bears)
    .get(function(req, res) {
        console.log("i'm here");
        Bear.find(function(err, bears) {
            if (err){
                res.send(err);
            } else {
                res.json(bears);
            }
        });
    });

// on routes that end in /bears/:bear_id
// ----------------------------------------------------
router.route('/bears/:bear_id')

    // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res) {
        Bear.findById(req.params.bear_id, function(err, bear) {
            if (err)
                res.send(err);
            res.json(bear);
        });
    })
   .put(function(req, res) {

    // use our bear model to find the bear we want
    Bear.findById(req.params.bear_id, function(err, bear) {

        if (err)
            res.send(err);

        bear.name = req.body.name;  // update the bears info

        // save the bear
        bear.save(function(err) {
            if (err)
                res.send(err);

            res.json({ message: 'Bear updated!' });
        });

    });
});



/*
router.route('/bears').post(function(req, res) {

    var bear = new Bear();      // create a new instance of the Bear model
    bear.name = req.body.name;  // set the bears name (comes from the request)

    // save the bear and check for errors
    bear.save(function(err) {
        if (err)
            res.send(err);

        res.json({ message: 'Bear created!' });
    });

}).get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err)
                res.send(err);

            res.json(bears);
        });
});
*/

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

app.use('/api', router);

// more routes for our API will happen here

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);