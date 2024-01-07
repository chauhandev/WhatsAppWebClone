var socket;
var form = document.getElementById("form");
var input = document.getElementById("input");
var messages = document.getElementById("messages");
var usernameInput = document.getElementById("username");
var signUp = document.getElementById("signUp");
var containerDiv = document.getElementById("container");
var currentlyChattingUser = "";
var currentChatGroup = "";
var UserPrivateChat = [];
var GroupChat = [];
var currentChatType ="";
const ChatType = {
    PRIVATE: 'private',
    GROUP: 'group'
};
  

function submitUsername() {
    var username = usernameInput.value.trim();
    if (username !== "") {
        // Initialize socket connection after getting the username
        socket = io();

        containerDiv.style.display = "flex";
        signUp.style.display = "none";

        const div = document.getElementById("headerUserName");
        div.textContent =  username.charAt(0).toUpperCase() + username.slice(1);

        // Notify server about the user's name
        socket.emit("User-Joined", username);
       
        // handle chat messages received from the server
        socket.on("chat message", function (data) {
            GroupChat[data.groupId] = GroupChat[data.groupId] || [];
            GroupChat[data.groupId].push({ messages: data.message, type: "received",});
            if (currentChatGroup != data.groupId) {
                var chat = document.querySelector('[data-group-id="' + data.groupId + '"]' );
                var chatNameSection = chat.getElementsByClassName("chatNameSection")[ 0 ];
                var spanElement = chat.querySelector("span");
                if (spanElement) {
                    // If span exists, update its text content
                    var currentValue = parseInt(spanElement.textContent, 10) || 0;
                    spanElement.textContent = currentValue + 1;
                } else {
                    // If span doesn't exist, create a new span element
                    var newSpan = document.createElement("span");
                    newSpan.textContent = "1";
                    newSpan.classList.add("unread");
                    chatNameSection.appendChild(newSpan);
                }
            } else {
                var bubble = document.createElement("div");
                var item = document.createElement("div");
                item.textContent = data.message;
                item.classList.add("chatMessage");
                bubble.appendChild(item);
                bubble.classList.add("speech-bubble");
                messages.appendChild(bubble);
                messages.scrollTop = messages.scrollHeight;
            }
        
        });
        // handle private messages received from the server
        socket.on("privateMessage", function (data) {
            UserPrivateChat[data.sender] = UserPrivateChat[data.sender] || [];
            UserPrivateChat[data.sender].push({ messages: data.message, type: "received",});
            if (currentlyChattingUser != data.sender) {
                var chat = document.querySelector('[data-user-id="' + data.sender + '"]' );
                var chatNameSection = chat.getElementsByClassName("chatNameSection")[ 0 ];
                var spanElement = chat.querySelector("span");
                if (spanElement) {
                    // If span exists, update its text content
                    var currentValue = parseInt(spanElement.textContent, 10) || 0;
                    spanElement.textContent = currentValue + 1;
                } else {
                    // If span doesn't exist, create a new span element
                    var newSpan = document.createElement("span");
                    newSpan.textContent = "1";
                    newSpan.classList.add("unread");
                    chatNameSection.appendChild(newSpan);
                }
            } else {
                var bubble = document.createElement("div");
                var item = document.createElement("div");
                item.textContent = data.message;
                item.classList.add("chatMessage");
                bubble.appendChild(item);
                bubble.classList.add("speech-bubble");
                messages.appendChild(bubble);
                messages.scrollTop = messages.scrollHeight;
            }
        });
        

        // handle new user joined message received from server
        socket.on("userJoinedGroup", (data) => {
            GroupChat[data.groupId] = GroupChat[data.groupId] || [];
            GroupChat[data.groupId].push({ messages: `${data.joinedUserName} Joined`, type: "userJoined",});

            if(currentChatGroup == data.groupId) {
                const messages = document.getElementById("messages");
                const div = document.createElement("div");
                div.textContent = `${data.joinedUserName} Joined`;
                div.classList.add("connection");
                messages.appendChild(div);
            }
        });

        // handle new user joined message received from server
        socket.on("User-Disconnected", (msg) => {
            const messages = document.getElementById("messages");
            const div = document.createElement("div");
            div.textContent = msg;
            div.classList.add("connection");
            messages.appendChild(div);
        });

        //handle if user is typing status
        socket.on("typing-status", (data) => {
            const typingStatus = document.getElementById("typingStatus");
            typingStatus.textContent = data.msg;
            if (data.status) 
                typingStatus.style.display = "block";
            else 
                typingStatus.style.display = "none";
        });

        //handle if online users is typing status
        socket.on("onlineUser", (data) => {
            const onlineUsers = document.getElementById("onlineUserList");
            while (onlineUsers.firstChild) {
                onlineUsers.removeChild(onlineUsers.firstChild);
            }
            const onlineText = document.getElementById("onlineText");
            onlineText.textContent = `Online Users :${Object.keys(data.connectedUsers).length - 1
                }`;
            Object.keys(onlineUsers).length;
            for (let key in data.connectedUsers) {
                if (key != socket.id) {
                    const divParent = document.createElement("div");
                    const div = document.createElement("div");
                    const nameDiv = document.createElement("div");
                    const imageDiv = document.createElement("div");
                    imageDiv.innerHTML ='<svg viewBox="0 0 212 212" height="49" width="49" preserveAspectRatio="xMidYMid meet" class="ln8gz9je ppled2lx" version="1.1" x="0px" y="0px" enable-background="new 0 0 212 212"><title>default-user</title><path fill="#DFE5E7" class="background" d="M106.251,0.5C164.653,0.5,212,47.846,212,106.25S164.653,212,106.25,212C47.846,212,0.5,164.654,0.5,106.25 S47.846,0.5,106.251,0.5z"></path><g><path fill="#FFFFFF" class="primary" d="M173.561,171.615c-0.601-0.915-1.287-1.907-2.065-2.955c-0.777-1.049-1.645-2.155-2.608-3.299 c-0.964-1.144-2.024-2.326-3.184-3.527c-1.741-1.802-3.71-3.646-5.924-5.47c-2.952-2.431-6.339-4.824-10.204-7.026 c-1.877-1.07-3.873-2.092-5.98-3.055c-0.062-0.028-0.118-0.059-0.18-0.087c-9.792-4.44-22.106-7.529-37.416-7.529 s-27.624,3.089-37.416,7.529c-0.338,0.153-0.653,0.318-0.985,0.474c-1.431,0.674-2.806,1.376-4.128,2.101 c-0.716,0.393-1.417,0.792-2.101,1.197c-3.421,2.027-6.475,4.191-9.15,6.395c-2.213,1.823-4.182,3.668-5.924,5.47 c-1.161,1.201-2.22,2.384-3.184,3.527c-0.964,1.144-1.832,2.25-2.609,3.299c-0.778,1.049-1.464,2.04-2.065,2.955 c-0.557,0.848-1.033,1.622-1.447,2.324c-0.033,0.056-0.073,0.119-0.104,0.174c-0.435,0.744-0.79,1.392-1.07,1.926 c-0.559,1.068-0.818,1.678-0.818,1.678v0.398c18.285,17.927,43.322,28.985,70.945,28.985c27.678,0,52.761-11.103,71.055-29.095 v-0.289c0,0-0.619-1.45-1.992-3.778C174.594,173.238,174.117,172.463,173.561,171.615z"></path><path fill="#FFFFFF" class="primary" d="M106.002,125.5c2.645,0,5.212-0.253,7.68-0.737c1.234-0.242,2.443-0.542,3.624-0.896 c1.772-0.532,3.482-1.188,5.12-1.958c2.184-1.027,4.242-2.258,6.15-3.67c2.863-2.119,5.39-4.646,7.509-7.509 c0.706-0.954,1.367-1.945,1.98-2.971c0.919-1.539,1.729-3.155,2.422-4.84c0.462-1.123,0.872-2.277,1.226-3.458 c0.177-0.591,0.341-1.188,0.49-1.792c0.299-1.208,0.542-2.443,0.725-3.701c0.275-1.887,0.417-3.827,0.417-5.811 c0-1.984-0.142-3.925-0.417-5.811c-0.184-1.258-0.426-2.493-0.725-3.701c-0.15-0.604-0.313-1.202-0.49-1.793 c-0.354-1.181-0.764-2.335-1.226-3.458c-0.693-1.685-1.504-3.301-2.422-4.84c-0.613-1.026-1.274-2.017-1.98-2.971 c-2.119-2.863-4.646-5.39-7.509-7.509c-1.909-1.412-3.966-2.643-6.15-3.67c-1.638-0.77-3.348-1.426-5.12-1.958 c-1.181-0.355-2.39-0.655-3.624-0.896c-2.468-0.484-5.035-0.737-7.68-0.737c-21.162,0-37.345,16.183-37.345,37.345 C68.657,109.317,84.84,125.5,106.002,125.5z"></path></g></svg>';
                    nameDiv.textContent = data.connectedUsers[key];
                    nameDiv.classList.add("chatNameSection");
                    divParent.appendChild(imageDiv);
                    div.appendChild(nameDiv);
                    div.classList.add("chatNameSection");
                    divParent.appendChild(div);

                    divParent.classList.add("chat");
                    onlineUsers.appendChild(divParent);
                    divParent.setAttribute("data-user-id", key);
                    divParent.setAttribute("data-user-name", data.connectedUsers[key]);
                    divParent.addEventListener("mousedown", function (event) {
                        currentChatType =  ChatType.PRIVATE;
                        const message = document.getElementById("messages");
                        const emptyBox = document.getElementById("emptyBox");
                        const chatBox = document.getElementById("chatBox");
                        emptyBox.style.display = "none";
                        chatBox.style.display = "flex";

                        var activeGroupdivs = document.getElementById("activeGroupList").getElementsByClassName("chat");
                        for (var i = 0; i < activeGroupdivs.length; i++) {
                            activeGroupdivs[ i ].classList.remove("selected");
                        }
                        var userChatdivs = document.getElementById("onlineUserList").getElementsByClassName("chat");
                        for (var i = 0; i < userChatdivs.length; i++) {
                            userChatdivs[ i ].classList.remove("selected");
                        }
                        // Add 'selected' class to the clicked div
                        divParent.classList.add("selected");
                        //remove previous chat messages
                        while (message.firstChild) {
                            message.removeChild(message.firstChild);
                        }
                        currentlyChattingUser = divParent.getAttribute("data-user-id");
                        currentChatGroup ="";
                        var spanElement = divParent.querySelector("span");
                        var chatNameSection = divParent.getElementsByClassName("chatNameSection")[ 0 ];
                        if (spanElement) 
                            chatNameSection.removeChild(spanElement);
                        populateChatWithUser(currentlyChattingUser);

                        const div = document.getElementById("headerChatName");
                        div.textContent =  divParent.getAttribute("data-user-name").charAt(0).toUpperCase() + divParent.getAttribute("data-user-name").slice(1);
                    });
                }
            }
        });

        socket.on("groupsAvailable", (data) => {
            const onlineUsers = document.getElementById("activeGroupList");
            while (onlineUsers.firstChild) {
                onlineUsers.removeChild(onlineUsers.firstChild);
            }
            for (const obj of data) {
                    const divParent = document.createElement("div");
                    const div = document.createElement("div");
                    const nameDiv = document.createElement("div");
                    const imageDiv = document.createElement("div");
                    imageDiv.innerHTML ='<svg viewBox="0 0 212 212" height="49" width="49" preserveAspectRatio="xMidYMid meet" class="ln8gz9je ppled2lx" version="1.1" x="0px" y="0px" enable-background="new 0 0 212 212"><title>default-user</title><path fill="#DFE5E7" class="background" d="M106.251,0.5C164.653,0.5,212,47.846,212,106.25S164.653,212,106.25,212C47.846,212,0.5,164.654,0.5,106.25 S47.846,0.5,106.251,0.5z"></path><g><path fill="#FFFFFF" class="primary" d="M173.561,171.615c-0.601-0.915-1.287-1.907-2.065-2.955c-0.777-1.049-1.645-2.155-2.608-3.299 c-0.964-1.144-2.024-2.326-3.184-3.527c-1.741-1.802-3.71-3.646-5.924-5.47c-2.952-2.431-6.339-4.824-10.204-7.026 c-1.877-1.07-3.873-2.092-5.98-3.055c-0.062-0.028-0.118-0.059-0.18-0.087c-9.792-4.44-22.106-7.529-37.416-7.529 s-27.624,3.089-37.416,7.529c-0.338,0.153-0.653,0.318-0.985,0.474c-1.431,0.674-2.806,1.376-4.128,2.101 c-0.716,0.393-1.417,0.792-2.101,1.197c-3.421,2.027-6.475,4.191-9.15,6.395c-2.213,1.823-4.182,3.668-5.924,5.47 c-1.161,1.201-2.22,2.384-3.184,3.527c-0.964,1.144-1.832,2.25-2.609,3.299c-0.778,1.049-1.464,2.04-2.065,2.955 c-0.557,0.848-1.033,1.622-1.447,2.324c-0.033,0.056-0.073,0.119-0.104,0.174c-0.435,0.744-0.79,1.392-1.07,1.926 c-0.559,1.068-0.818,1.678-0.818,1.678v0.398c18.285,17.927,43.322,28.985,70.945,28.985c27.678,0,52.761-11.103,71.055-29.095 v-0.289c0,0-0.619-1.45-1.992-3.778C174.594,173.238,174.117,172.463,173.561,171.615z"></path><path fill="#FFFFFF" class="primary" d="M106.002,125.5c2.645,0,5.212-0.253,7.68-0.737c1.234-0.242,2.443-0.542,3.624-0.896 c1.772-0.532,3.482-1.188,5.12-1.958c2.184-1.027,4.242-2.258,6.15-3.67c2.863-2.119,5.39-4.646,7.509-7.509 c0.706-0.954,1.367-1.945,1.98-2.971c0.919-1.539,1.729-3.155,2.422-4.84c0.462-1.123,0.872-2.277,1.226-3.458 c0.177-0.591,0.341-1.188,0.49-1.792c0.299-1.208,0.542-2.443,0.725-3.701c0.275-1.887,0.417-3.827,0.417-5.811 c0-1.984-0.142-3.925-0.417-5.811c-0.184-1.258-0.426-2.493-0.725-3.701c-0.15-0.604-0.313-1.202-0.49-1.793 c-0.354-1.181-0.764-2.335-1.226-3.458c-0.693-1.685-1.504-3.301-2.422-4.84c-0.613-1.026-1.274-2.017-1.98-2.971 c-2.119-2.863-4.646-5.39-7.509-7.509c-1.909-1.412-3.966-2.643-6.15-3.67c-1.638-0.77-3.348-1.426-5.12-1.958 c-1.181-0.355-2.39-0.655-3.624-0.896c-2.468-0.484-5.035-0.737-7.68-0.737c-21.162,0-37.345,16.183-37.345,37.345 C68.657,109.317,84.84,125.5,106.002,125.5z"></path></g></svg>';
                    nameDiv.textContent = obj.name;
                    nameDiv.classList.add("chatNameSection");
                    divParent.appendChild(imageDiv);
                    div.appendChild(nameDiv);
                    div.classList.add("chatNameSection");
                    divParent.appendChild(div);

                    divParent.classList.add("chat");
                    onlineUsers.appendChild(divParent);
                    divParent.setAttribute("data-group-id", obj.id);
                    divParent.setAttribute("data-group-name", obj.name);
                    divParent.addEventListener("mousedown", function (event) {
                        currentChatType =  ChatType.GroupChat;
                        const message = document.getElementById("messages");
                        const emptyBox = document.getElementById("emptyBox");
                        const chatBox = document.getElementById("chatBox");
                        emptyBox.style.display = "none";
                        chatBox.style.display = "flex";

                        var activeGroupdivs = document.getElementById("activeGroupList").getElementsByClassName("chat");
                        for (var i = 0; i < activeGroupdivs.length; i++) {
                            activeGroupdivs[ i ].classList.remove("selected");
                        }
                        var userChatdivs = document.getElementById("onlineUserList").getElementsByClassName("chat");
                        for (var i = 0; i < userChatdivs.length; i++) {
                            userChatdivs[ i ].classList.remove("selected");
                        }
                        // Add 'selected' class to the clicked div
                        divParent.classList.add("selected");
                        //remove previous chat messages
                        while (message.firstChild) {
                            message.removeChild(message.firstChild);
                        }
                        currentChatGroup = divParent.getAttribute("data-group-id");
                        currentlyChattingUser = "";
                        var spanElement = divParent.querySelector("span");
                        var chatNameSection = divParent.getElementsByClassName("chatNameSection")[ 0 ];
                        if (spanElement) 
                            chatNameSection.removeChild(spanElement);
                        populateChatWithGroup(currentChatGroup);

                        const div = document.getElementById("headerChatName");
                        div.textContent =  divParent.getAttribute("data-group-name").charAt(0).toUpperCase() + divParent.getAttribute("data-group-name").slice(1);
                        socket.emit("Join-Group", {groupId: currentChatGroup});
                    });
            }
        });
    }
}

form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value) {
        if(currentChatType === ChatType.PRIVATE) {
            var data = { recepient: currentlyChattingUser, msg: input.value };
            socket.emit("privateMessage", data);
            UserPrivateChat[ currentlyChattingUser ] = UserPrivateChat[ currentlyChattingUser ] || [];
            UserPrivateChat[ currentlyChattingUser ].push({messages: data.msg, type: "sent", });
        }
        else{
            var data = { groupId: currentChatGroup, msg: input.value };
            socket.emit('chat message', data);
            GroupChat[ currentChatGroup ] = GroupChat[ currentChatGroup ] || [];
            GroupChat[ currentChatGroup ].push({messages: data.msg, type: "sent", });
        }
        var bubble = document.createElement("div");
        var item = document.createElement("div");
        item.textContent = input.value;
        item.classList.add("chatMessage");
        bubble.appendChild(item);
        bubble.classList.add("speech-bubble-alt");
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        input.value = "";

      
    }
});

function handleTypingStatus() {
    let typingTimer;
    return function () {
        if (typingTimer !== undefined) {
            clearTimeout(typingTimer);
        }
        socket.emit("typing-status", { status: true });

        typingTimer = setTimeout(function () {
            socket.emit("typing-status", { status: false });
        }, 1000);
    };
}

function changeRoom() {
    const newRoom = document.getElementById("newRoom").value;

    // Emit 'changeRoom' event to the server
    socket.emit("changeRoom", newRoom);
}

const debouncedHandleTyping = handleTypingStatus();

function populateChatWithUser(recepient) {
    let chatWithRecepient = UserPrivateChat[ recepient ] || [];
    let messages = document.getElementById("messages");
    if (Array.isArray(chatWithRecepient)) {
        chatWithRecepient.forEach((element) => {
            let bubble = document.createElement("div");
            var item = document.createElement("div");
            item.textContent = element.messages;
            item.classList.add("chatMessage");
            bubble.appendChild(item);
            if (element.type === "received") bubble.classList.add("speech-bubble");
            else bubble.classList.add("speech-bubble-alt");
            messages.appendChild(bubble);
        });
    }
    messages.scrollTop = messages.scrollHeight;
}
function populateChatWithGroup(recepient) {
    let chatWithRecepient = GroupChat[ recepient ] || [];
    let messages = document.getElementById("messages");
    if (Array.isArray(chatWithRecepient)) {
        chatWithRecepient.forEach((element) => {
            if(element.type == "userJoined" || element.type == "userLeft"){
                const messages = document.getElementById("messages");
                const div = document.createElement("div");
                div.textContent = element.messages;
                div.classList.add("connection");
                messages.appendChild(div);
            }
            else{
                let bubble = document.createElement("div");
                var item = document.createElement("div");
                item.textContent = element.messages;
                item.classList.add("chatMessage");
                bubble.appendChild(item);
                if (element.type === "received") bubble.classList.add("speech-bubble");
                else bubble.classList.add("speech-bubble-alt");
                messages.appendChild(bubble);
            }
        
        });
    }
    messages.scrollTop = messages.scrollHeight;
}
function triggerUpload(){
    const inputElement = document.getElementById("uploadInput");
    inputElement.click();
}
function previewImage(event){
    const input = event.target;
    const preview = document.getElementById('previewImage');
    const profilePicture = document.getElementById('profilePicture');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          profilePicture.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
      }
}

function toggleCharCount(show){
    const charCount = document.getElementById('charCount');
    if (show)
      charCount.style.display = 'block';
    else
      charCount.style.display = 'none';
}


function updateCharCount(){
    const input = document.getElementById('username');
    const countElement = document.getElementById('charCount');

    const currentCount = input.value.length;
    const maxLength = parseInt(input.getAttribute('maxlength'));

    countElement.textContent = `${currentCount}/${maxLength}`;
}


function createGroup(){
    const input = document.getElementById('createGroupInput');
    const groupName = input.value;
    if(groupName){
        const msg = {groupName: groupName};
        socket.emit('createGroup',msg);
    
        input.value = "";
    }
    
}
