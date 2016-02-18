window.onload = function() { 
 	var socket = io.connect('http://localhost:3000'); 
	var code = document.getElementById("code"); 
	var init =false;   

	socket.on('message', function (data) {  
		 console.log(data);
	}); 
	 
	
 
	socket.on('code', function (data) { 
		var content = document.getElementById('content');  
		if(data.code===document.getElementById('code').value){ return;}
		document.getElementById('code').value=data.code;  
		 
	}); 
	
	socket.on('html', function (data) { 
		document.getElementById('contentLabel').innerHTML ="Selected by " + data.id;
		document.getElementById('content').style.display="block";
		document.getElementById('content').style.height="auto";
		document.getElementById('content').innerHTML=data.html;
	}); 
 
	socket.on("typing",function(data){
		if(document.getElementById('using').innerHTML.indexOf(data)<0){
			document.getElementById('using').innerHTML += data+"<br/>"; 
		}
	});

	socket.on("nottyping",function(data){
	//	if(document.getElementById('using').innerHTML.indexOf(data.user)>0){
			console.log("done");
			document.getElementById('using').innerHTML =""; 
	//	}
	});
	socket.on("setuser", function(data){
 		socket.user = data.user;
 		document.getElementById('name').value =data.user;
 	});
	
	socket.on("chat",function(data){
		console.log("chatrecievef");
		document.getElementById("chat").innerHTML ="<b>"+data.user+":</b> "+data.chat+"<br/>"+	document.getElementById("chat").innerHTML;
	});
	
	
	document.getElementById('code').onkeydown = function(){ 
		socket.emit("typing"); 
	};
	document.getElementById('code').onkeyup = function(){
		socket.emit("code",code.value); 
	};
  
  
	
	document.getElementById("code").onmouseup = function(event){  
		var text = getSelectionText(); 
		if(text.toString().length>0){
			document.getElementById("content").style.display="block";
			socket.emit("html",text);  
			console.log("sendinghmtl");
		}else{
			document.getElementById("content").style.display="none";
			document.getElementById("contentLabel").innerHTML="";
		}
		if(code.value!==tempValue || drop){
			helpr = false;
			socket.emit("code",code.value);
			drop=false;
		}
	};
	
	
	var helpr= false;
	var tempValue;
	var tempSelect;
	
	
	document.body.onmousedown = function(event){
		tempValue=document.getElementById("code").value;
		tempSelect = getSelectionText();
	};
	
	
	document.getElementById("clear").onclick=function(event){
		if(document.getElementById("clear").value==="CLICK TO CONFIRM"){ 
			socket.emit("clear");
			document.getElementById("clear").value="Clear text";
		}else{ 
			document.getElementById("clear").value="CLICK TO CONFIRM" ;
		}
	};
	
	document.getElementById("restore").onclick=function(event){
		socket.emit("restore");
	};
	document.getElementById("restoreOne").onclick=function(event){
		socket.emit("restoreOne");
	};	
	
	var drop=true;
	
	
	document.getElementById("code").addEventListener('drop',function(event){
		
		socket.emit("code",	document.getElementById("code").value);
	},true);  
	
	
	document.body.onclick =function(event){
		if(event.target!=document.getElementById("clear")){ 
			if(document.getElementById("clear").value==="CLICK TO CONFIRM"){  
				document.getElementById("clear").value="Clear text";
			}	
		}
	};
	
	document.getElementById("username").onclick=function(){
		socket.emit("setuser", {user:document.getElementById('name').value});
		socket.user = document.getElementById('name').value;
	};
	document.getElementById("send").onclick=function(event){
		socket.emit("chat",{user:socket.user,chat:chatMessage.value});
		document.getElementById("chat").innerHTML ="<b>"+socket.user+":</b> "+chatMessage.value+"<br/>"+document.getElementById("chat").innerHTML ;
	};
	
	document.getElementById("content").style.display="none"; 
	function getSelectionText() {
		if (window.getSelection) {
			try {
				var s = document.getElementById('code');
	        //    var t = s.get(0);
	            return s.value.substring(s.selectionStart, s.selectionEnd);
	        } catch (e) {
	            console.log('Cant get selection text');
	            console.log(e);
	        }
	    } 
	    // For IE
	    if (document.selection && document.selection.type != "Control") {
	        return document.selection.createRange().text;
	    }
	}
}