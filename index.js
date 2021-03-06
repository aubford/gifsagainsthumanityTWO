var express = require('express');
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http)

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', function(req, res){
  res.render('index');
});


///SOCKETS///
//code for each socket connection.
var questionBank = require("./public/questionBank.js")
var userCounter = 0
var roomId
var startingQuestionNumber

io.on('connection', function(socket){
//////////////SETUP//////////////////////////
    //determines which player# this is.
    var playerId = userCounter

    //if socket is a Player1, then it's socket.id is the new roomId.
    if (userCounter === 0){
      roomId = socket.id
      startingQuestionNumber = Math.floor(Math.random() * questionBank.questions.length)
    //other players add this roomId.
    }else{
      socket.join(roomId)
    }

    //OUTPUT-THIS EVENT: tack userId and roomId to the new socket's main.js.
    socket.emit('setup', {"playerId" : playerId, "roomId" : roomId})

    if (userCounter === 4){
      io.to(roomId).emit('deal',{"question":questionBank.questions[startingQuestionNumber]})
    }

    //counter for userCounter increments between 1 and 4.
    if (userCounter !== 4) {
      userCounter++
    }else{
      userCounter = 0;
    }

/////////////ACTIONS//////////////////////////

    ///HAND CARD///

    //INCOMING EVENT: player clicked a hand-card
    socket.on('sendcard', function(res){
      //OUTPUT-ALL EVENT: send that card to other palyers in room.
      io.to(res.roomId).emit('sendcard', res.card)
    })



    ///WINNING CARD///

    //INCOMING EVENT:  selector chose winning card.
    socket.on('selection', function(res){
      //OUTPUT-ALL EVENT: send winning player# to all in room.
      io.to(res.roomId).emit('sendWinner', res.playerWinner )


      //OUTPUT-ALL EVENT: send 'newgame' event to all players in room.
      setTimeout(function(){

      io.to(res.roomId).emit('newgame', {'newQuestion': questionBank.questions[Math.floor(Math.random() * questionBank.questions.length)]})

    },2500)

    })



});



var port = process.env.PORT || 8080
http.listen(port, function(){
  console.log('listening on' + port);
});


function randomQuestion(dataObj){
  return Math.floor(Math.random() * dataObj.length)
}
