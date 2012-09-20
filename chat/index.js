var http = require('http'),
    fs = require('fs'),
    server,
    io;

server = http.createServer(function(req, res){
  fs.readFile(__dirname + '/index.html', function(err, data){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
});

server.listen(5000);

//使用者名稱
var user_name = {};

io = require('socket.io').listen(server);

//連線時會執行的內容
io.sockets.on('connection', function(socket){

  //當client端emit 'send_chat' 時執行
  socket.on('send_chat', function(data){
    io.sockets.emit('update_chat_content', socket.user_name, data);
  });

  //當client端emit 'add_user' 時執行
  socket.on('add_user', function(user_name){

    //儲存user_name到socket session
    socket.user_name = user_name;

    //加入user_name 到 user_name list
    user_name[user_name] = user_name;

    //呼叫Client端的 update_chat事件
    socket.emit('update_chat_content', 'SERVER:', socket.user_name + ' has connected');

    //呼叫所有Client端的 update_chat事件
    socket.broadcast.emit('update_chat_content', 'SERVER:',user_name + ' has connected');

    //呼叫Client端的 update_user事件
    io.sockets.emit('update_user', user_name);
  });

  //當Client端斷線時執行
  socket.on('disconnect', function(){

    //從user_name list中刪除使用者
    delete user_name[socket.user_name];

    //呼叫Client端的 update_user事件更新使用者列表
    io.sockets.emit('update_user', user_name);

    //廣播所有Client端的 update_chat_content事件，通知某某使用者離線
    socket.broadcast.emit('update_chat_content', 'SERVER:', socket.user_name + ' has disconnected');
  });
});