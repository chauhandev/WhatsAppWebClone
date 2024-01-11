const express = require("express")
const app = express();
const  http = require("http")
const path = require("path")
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server);
const connectedUsers = {};
const groups = [];

io.on('connection', (socket) => {
   
    socket.on('privateMessage', (data) => {
            io.to(data.recepient).emit('privateMessage', {
                sender: socket.id,
                senderName:connectedUsers[socket.id],
                message: data.msg,
                time: data.time
            });
     }
    ); 
    socket.on('User-Joined', (msg) => {
        connectedUsers[socket.id] = msg;
        // Notify all connected clients when a new user connects
        // socket.broadcast.emit('User-Joined', `${msg} Joined`);
        io.emit('onlineUser',{connectedUsers});    
        io.emit('groupsAvailable', groups);    
        }
    ); 

    // Notify all connected clients when a user disconnects
    socket.on('disconnect', () => {
        const disconnectedUsername = connectedUsers[socket.id];
        delete connectedUsers[socket.id];
        io.emit('User-Disconnected', `${disconnectedUsername} Disconnected`);
        socket.broadcast.emit('onlineUser',{connectedUsers});
    });

     // Notify all connected clients when a user typing
     socket.on('typing-status', (msg) => {
        if(msg.status){
            socket.broadcast.emit('typing-status', {status:true,msg :`${connectedUsers[socket.id]} is typing...`});
        }
        else{
            socket.broadcast.emit('typing-status', {status:false,msg :""}); 
        }
    });

    socket.on('chat message', (data) => {
        const group = groups.find(group => String(group.id)=== data.groupId)
        // socket.to(Number(msg.groupId)).emit('chat message',data); 
        socket.to(Number(data.groupId)).emit('chat message', {message : data.msg, groupId : data.groupId ,name :group.name ,senderName :connectedUsers[socket.id],time:data.time});   
     }
    ); 
    socket.on('createGroup', (data) => {
           const newGroup = {
                id: Date.now(), 
                name: data.groupName,
                members: [socket.id]
            };
            groups.push(newGroup);
            socket.join(newGroup.id);
          //  io.to(socket.id).emit('groupCreated', newGroup.name);
            io.emit('groupsAvailable', groups);
      });

      socket.on('Join-Group', (data) => {
        const groupId = data.groupId;
        
        // Find the existing group based on the groupId
        const existingGroup = groups.find(group => String(group.id) === groupId);
      
        if (existingGroup) {
          // Add the user to the existing group
       if(!existingGroup.members.includes(socket.id))
            {
               existingGroup.members.push(socket.id);
               socket.join(existingGroup.id);
               socket.to(existingGroup.id).emit('userJoinedGroup', { groupName: existingGroup.name, groupId: existingGroup.id, joinedUserName: connectedUsers[socket.id] });
               io.emit('groupsAvailable', groups);
            }
        } else {
          // If the group does not exist, notify the user
          io.to(socket.id).emit('groupNotFound');
        }
      });
});

app.use(express.static(path.resolve("./public")))

app.get('/', (req, res) => {
    res.sendFile('/public/index.html');
  });

server.listen(9000,()=>{
    console.log("server started at port 9000")
});