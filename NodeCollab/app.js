
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
/**
 * Old sahered code for restoring
 */
var oldShared= [];
/**
 *  Shared text to be edited across the network 
 *  */
var shared="";
/** 
 * Users counter
 */
var userCount = 0;
var io = require('socket.io').listen(app.listen(app.get('port')));
console.log('Node Js Colab server listening on port ' + app.get('port'));

/**
 * Sets the socket id to the current user count
 * @param socket
 */
function setId(socket){
 		//socket.id =-"user"+userCount++;
 		socket.user="user"+userCount++
 		console.log(socket.user);
 		socket.emit("setuser",{user:socket.user});
}

io.sockets.on('connection', function (socket) {  
	
	setId(socket); 
	socket.emit("code",{code:shared,id:socket.user} );
	
 	socket.on('disconnect', function (event) {
 		  
 	  });
	
 	socket.on('clear', function(event){
 		oldShare.push(shared)
 		shared="";
 		
 		io.sockets.emit("code",{code:shared , id:socket.user});
 	
 	});
 	socket.on('typing', function(){
 		isUsing(socket);
 	});	
 
 	socket.on('code',function(data){
 		oldShared.push(shared);
 		shared=data; 
 		socket.broadcast.emit("code",{code:shared,id:socket.user});  
		console.log(shared);
	}); 
  
 	socket.on('html',function(data){   
 		io.sockets.emit("html",{html:getSharedHTML(data),id:socket.user});
 	});  
 	
 	socket.on("restoreOne", function(){
 		if(oldShared.length<0) {return;} 
 		shared = oldShared[oldShared.length-1];
 		oldShared.pop(shared); 	 
 		io.sockets.emit("code",{code:shared,id:socket.user});
 	});
 	
 	
 	socket.on("restore", function(){
 		if(oldShared.length<0) return;
 		var temp=5;
 		while(oldShared.length>0 && temp!=0){ 
	 		shared = oldShared[oldShared.length-1];
	 		oldShared.pop(shared);
	 		temp--;
 		}
 		io.sockets.emit("code",{code:shared,id:socket.user});
 	});
 	socket.on("setuser", function(data){
 		socket.user = data.user;
 	});
 	
 	socket.on("chat", function(data){
 		socket.broadcast.emit("chat", data);
 	});
	 
});

function getSharedHTML(sharedCode){
	if(!sharedCode || sharedCode.length<=0) { return "";}
	var sharedHTML = sharedCode.replace(/  /g, '\u00a0\u00a0') 
	sharedHTML= sharedHTML.replace(/(?:\r\n|\r|\n)/g, '<br/>'); 
	var temp="";
	var inBrace =true;
	for(var i= 0 ; i< sharedHTML.length;i++){
		if(sharedHTML[i]==='<'){
			inBrace=true;
		}
		if(!inBrace){ 
			temp+="<span id='aaa"+i+"'>"+sharedHTML[i] +"</span>";
		}else{
			temp+=sharedHTML[i];
		}
		if(sharedHTML[i]==='>'){
			inBrace=false;
		}
	}
	return temp;
	
} 

var cur= [];
function isUsing(socket){
	for(var i=0; i<cur.length; i++){
		if(cur[i] == socket.id){
			console.log("not setting")
			return;
			}
	}
	cur.push(socket.id);
 	socket.broadcast.emit("typing",socket.user );
	setTimeout(function(){

		console.log("indisfe function");
		var s = null;
		for(var i=0; i<cur.length; i++){
			if(cur[i] == socket.id){
				s=cur[i];
			}
		} 
		
	cur.pop(s);
		 
		socket.broadcast.emit("nottyping",socket.user);
	}, 4000);
}