// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");


var app = express();
var http      =     require('http').Server(app);
var io        =     require("socket.io")(http);

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'startboot'
});



var router=express.Router();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(express.static(path.join(__dirname, 'public')));


var tagID;
var rssi;
var time;




connection.connect(function(err){
if(!err) {
    console.log("Database is connected ... nn");    
} else {
    console.log("Error connecting database ... nn");    
}
});

connection.query('CREATE TABLE TagRecords (tagid char, rssi char, d_time char)', function (err, result) {
                        if (err) console.log(err);
                        else console.log('Table created ' + result);
                    });
					


io.on('connection',function(socket){  
   // console.log("A user is connected");
//io.emit('data updates',"hejhrhwe");
socket.on('getdatabase', function (data) {
       // io.sockets.emit('message', data);
	   console.log("connection clicked");
	   var queryString = 'SELECT * FROM TagRecords';
 
        connection.query(queryString, function(err, rows, fields) {
			if (err) throw err;
            var out='<Table width=\"100%\" class=\"table table-striped table-bordered table-hover\" id=\"dataTables-example\"><thead><tr><th>TagID</th><th>RSSI</th><th>TIME</th></tr></thead><tbody>'
			for (var i in rows) {
				//console.log('Post Titles: ', rows[i].tagid);
				out=out+'<tr><td>'+rows[i].tagid+'</td><td>'+rows[i].rssi+'</td><td>'+rows[i].d_time+'</td></tr>';
			 }
			out=out+'</tbody></table>';
			io.sockets.emit('takedatabase', out);
		});
    });
	
 });





app.post("/", function(req, res) {
   /* if(!req.body.username || !req.body.password || !req.body.twitter) {
        return res.send({"status": "error", "message": "missing a parameter"});
    } else {
        return res.send(req.body.method);
    }
	*/

var data=req.body;
console.log(data);
//console.log(JSON.stringify(data));
var data=JSON.parse(JSON.stringify(data));
//tagID=data[1].tagid;
//rssi=data[1].rssi;
//time=data[1].time;
//var arr=data.tags;
  //             console.log("data = "+arr);
for(var key in data.tags){
	var dd=JSON.parse(JSON.stringify(data.tags[key]));
	 tagID=dd.tagid;
	 rssi=dd.rssi;
	 time=dd.time;
	 connection.query('insert into TagRecords values(\''+tagID+'\',\''+rssi+'\',\''+time+'\')', function (err, result) {
                        if (err) console.log(err);
                        else console.log('data insert ' + result);
                    });
					
}
 io.emit('data updates',data);
 
});

app.get("/most_popular",function(req, res) {
   
console.log("most popular");
 
res.send(tagID+" ," +rssi+","+time);
});




app.get("/",function(req, res) {
   res.sendFile(__dirname+"/public/index.html");
});

// [END hello_world]

/*if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}*/



http.listen(process.env.PORT || 8080,function(){
  console.log("Listening on 8080");
});

module.exports = app;
