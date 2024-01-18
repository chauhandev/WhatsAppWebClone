const express = require("express")
const Actions = require("./Actions")
require('dotenv').config();
const app = express();
const  http = require("http")
const path = require("path")
const server = http.createServer(app)
const { Server } = require("socket.io");
const io = new Server(server,{
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowUpgrades: true,
  cookie: false, // disable cookies
});
const connectedUsers = {};
const groups = [];
const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
   
    socket.on(Actions.PRIVATECHAT, (data) => {
            io.to(data.recepient).emit(Actions.PRIVATECHAT, {
                sender: socket.id,
                senderName:connectedUsers[socket.id]?.userName??"",
                message: data.msg,
                time: data.time,
                file: data.file
            });
     }
    ); 
    socket.on(Actions.USERJOINED, (msg) => {
        connectedUsers[socket.id] = msg;
        // Notify all connected clients when a new user connects
        io.emit(Actions.USERSONLINE,{connectedUsers});    
        io.emit(Actions.AVAILABLEGROUPS, groups);    
        }
    ); 

    // Notify all connected clients when a user disconnects
    socket.on('disconnect', () => {
        if (connectedUsers[socket.id]) {
            const disconnectedUsername = connectedUsers[socket.id].userName;
            delete connectedUsers[socket.id];  
            if (Object.keys(connectedUsers).length === 0) {
                groups.length = 0;
            } 
            io.emit(Actions.USERDISCONNECTED, `${disconnectedUsername} Disconnected`);
            socket.broadcast.emit(Actions.USERSONLINE, { connectedUsers });
        } else {
            // Handle the case where the user is not found in connectedUsers
            console.log('Unexpected disconnect: User not found in connectedUsers');
        }
    });

     // Notify all connected clients when a user typing
     socket.on(Actions.TYPINGSTATUS, (msg) => {
        if(msg.status){
            socket.broadcast.emit(Actions.TYPINGSTATUS, {status:true,msg :`${connectedUsers[socket.id]?.userName ?? ""} is typing...`});
        }
        else{
            socket.broadcast.emit(Actions.TYPINGSTATUS, {status:false,msg :""}); 
        }
    });

    socket.on(Actions.GROUPCHAT, (data) => {
        const group = groups.find(group => String(group.id)=== data.groupId)
        // socket.to(Number(msg.groupId)).emit('chat message',data); 
        socket.to(Number(data.groupId)).emit(Actions.GROUPCHAT, {message : data.msg, groupId : data.groupId ,name :group.name ,senderName :connectedUsers[socket.id].userName,time:data.time,file: data.file});   
     }
    ); 
    socket.on(Actions.CREATEGROUP, (data) => {
           const newGroup = {
                id: Date.now(), 
                name: data.groupName,
                members: [socket.id]
            };
            groups.push(newGroup);
            socket.join(newGroup.id);
          //  io.to(socket.id).emit('groupCreated', newGroup.name);
            io.emit(Actions.AVAILABLEGROUPS, groups);
      });

      socket.on(Actions.JOINGROUP, (data) => {
        const groupId = data.groupId;
        
        // Find the existing group based on the groupId
        const existingGroup = groups.find(group => String(group.id) === groupId);
      
        if (existingGroup) {
          // Add the user to the existing group
       if(!existingGroup.members.includes(socket.id))
            {
               existingGroup.members.push(socket.id);
               socket.join(existingGroup.id);
               socket.to(existingGroup.id).emit(Actions.NEWMEMBERJOINEDGROUP, { groupName: existingGroup.name, groupId: existingGroup.id, joinedUserName: connectedUsers[socket.id].userName });
               io.emit(Actions.AVAILABLEGROUPS, groups);
            }
        } else {
          // If the group does not exist, notify the user
          io.to(socket.id).emit('groupNotFound');
        }
      });

      socket.on(Actions.LOGOUT, () => {
        if (connectedUsers[socket.id]) {
            const disconnectedUsername = connectedUsers[socket.id].userName;
            delete connectedUsers[socket.id];  
            if (Object.keys(connectedUsers).length === 0) {
                groups.length = 0;
            } 
            io.emit(Actions.USERDISCONNECTED, `${disconnectedUsername} Disconnected`);
            socket.broadcast.emit(Actions.USERSONLINE, { connectedUsers });
        } else {
            // Handle the case where the user is not found in connectedUsers
            console.log('Unexpected disconnect: User not found in connectedUsers');
        }
    });

    socket.on('close', () => {
       console.log('connection closed');
    });
});

app.use(express.static(path.resolve("./public")))

app.get('/', (req, res) => {
    res.sendFile('/public/index.html');
  });

server.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`);
});