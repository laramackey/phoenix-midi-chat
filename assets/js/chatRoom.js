import { userNameGenerator, userColourGenerator } from './userInfoGenerators';
import { PianoController } from './piano';

class ChatRoom {
  constructor(socket) {
    this.userColour = userColourGenerator();
    this.socket = socket;
    this.channel = null;
    this.userName = null;
    this.init();
  }
  init() {
    document.getElementById('userName').value = userNameGenerator();
    document.getElementById('joinForm').addEventListener('submit', (e) => {
      e.preventDefault();

      const piano = new PianoController(this.userColour);
      piano.startTone();

      const userName = document.getElementById('userName').value;
      this.userName = userName;
      piano.setUserName(userName);

      const channel = this.socket.channel('piano:lobby', {
        userName: userName,
        userColour: this.userColour,
      });
      this.channel = channel;
      piano.setChannel(channel);
      channel.join();

      this.getPrecenseList();
      this.listenForBandMates();
      this.handleChatMessage();

      document.getElementById('messageSubmit').disabled = false;
      document.getElementById('sendMessage').addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
    });
  }

  sendMessage() {
    const message = document.getElementById('message').value;
    if (message) {
      this.channel.push('message', {
        name: this.userName,
        body: { userColour: this.userColour, message },
      });
      document.getElementById('message').value = '';
      const chatBox = document.getElementById('chatBox');
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  handleChatMessage() {
    this.channel.on('message', (payload) => {
      const chatBox = document.querySelector('#chatBox');
      const msgBlock = document.createElement('p');

      if (payload.body.message) {
        msgBlock.insertAdjacentHTML(
          'beforeend',
          `<p style="color:${payload.body.userColour}"><b>${payload.name}:</b> ${payload.body.message}</p>`
        );
        chatBox.appendChild(msgBlock);
      }
    });
  }

  getPrecenseList() {
    this.channel.on('presence_state', (state) => {
      const onlineUserBox = document.querySelector('#usersBox');
      const onlineUsers = document.createElement('p');
      const userData = Object.keys(state)
        .map((user) => Object.assign({ user }, state[user].metas[0].user_data))
        .filter((user) => user.hasOwnProperty('userName'));
      userData.forEach((user) => {
        onlineUsers.insertAdjacentHTML(
          'beforeend',
          `<p id="${user.user}" style="color:${user.userColour}"><b>${user.userName}</b></p>`
        );
      });
      onlineUserBox.innerHTML = '';
      onlineUserBox.appendChild(onlineUsers);
    });
  }

  listenForBandMates() {
    this.channel.on('presence_diff', (payload) => {
      const chatBox = document.querySelector('#chatBox');
      const msgBlock = document.createElement('p');
      const onlineUserBox = document.querySelector('#usersBox');
      const onlineUsers = document.createElement('p');

      const joiners = Object.keys(payload.joins)
        .map((user) =>
          Object.assign({ user }, payload.joins[user].metas[0].user_data)
        )
        .filter((user) => user.hasOwnProperty('userName'));
      joiners.forEach((user) => {
        msgBlock.insertAdjacentHTML(
          'beforeend',
          `<p style="color:${user.userColour}"><b>${user.userName}:</b> is in da house</p>`
        );
        if (!document.getElementById(user.user)) {
          onlineUsers.insertAdjacentHTML(
            'beforeend',
            `<p id="${user.user}" style="color:${user.userColour}"><b>${user.userName}</b></p>`
          );
        }
      });
      const leavers = Object.keys(payload.leaves)
        .map((user) =>
          Object.assign({ user }, payload.leaves[user].metas[0].user_data)
        )
        .filter((user) => user.hasOwnProperty('userName'));
      leavers.forEach((user) => {
        msgBlock.insertAdjacentHTML(
          'beforeend',
          `<p style="color:${user.userColour}"><b>${user.userName}:</b> has left the room</p>`
        );
        document.getElementById(user.user).remove();
      });
      chatBox.appendChild(msgBlock);
      onlineUserBox.appendChild(onlineUsers);
    });
  }
}

export default ChatRoom;
