import { Presence } from 'phoenix';
import { userNameGenerator, userColourGenerator } from './userInfoGenerators';
import { PianoController } from './piano';
import { MidiHandler } from './midiHandler';

class ChatRoom {
  constructor(socket) {
    this.userColour = userColourGenerator();
    this.presences = {};
    this.channel = socket.channel('piano:lobby');
    this.userName = null;
    this.init();
  }
  init() {
    const piano = new PianoController(this.userColour, this.channel);
    new MidiHandler(piano);
    this.channel.join();
    this.getPrecenseList();
    this.listenForBandMates();

    document.getElementById('userName').value = userNameGenerator();
    document.getElementById('joinForm').addEventListener('submit', (e) => {
      e.preventDefault();
      piano.startTone();
      const userName = document.getElementById('userName').value;
      this.userName = userName;
      piano.setUserName(userName);
      piano.joinChannel();
      this.channel.push('newUser', {
        user_name: userName,
        user_colour: this.userColour,
      });
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
        userColour: this.userColour,
        message,
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

      if (payload.message) {
        msgBlock.insertAdjacentHTML(
          'beforeend',
          `<p style="color:${payload.userColour}"><b>${payload.name}:</b> ${payload.message}</p>`
        );
        chatBox.appendChild(msgBlock);
      }
    });
  }

  getPrecenseList() {
    this.channel.on('presence_state', (state) => {
      this.presences = Presence.syncState(this.presences, state);
      this.updateOnlineUsersList();
    });
  }

  updateOnlineUsersList() {
    const onlineUserBox = document.querySelector('#usersBox');
    const onlineUsers = document.createElement('p');
    this.getUserList(this.presences).forEach((user) => {
      onlineUsers.insertAdjacentHTML(
        'beforeend',
        `<p id="${user.user}" style="color:${user.userColour}"><b>${user.userName}</b></p>`
      );
    });
    onlineUserBox.innerHTML = '';
    onlineUserBox.appendChild(onlineUsers);
  }

  getUserList(users) {
    return Object.keys(users)
      .filter((user) => users[user]?.metas[0]?.user_name)
      .map((user) => {
        return {
          userId: user,
          userName: users[user].metas[0].user_name,
          userColour: users[user].metas[0].user_colour,
        };
      });
  }
  announceBandMates(users, message) {
    const msgBlock = document.createElement('p');
    this.getUserList(users).forEach((user) => {
      msgBlock.insertAdjacentHTML(
        'beforeend',
        `<p style="color:${user.userColour}"><b>${user.userName}:</b> ${message}</p>`
      );
    });
    return msgBlock;
  }

  listenForBandMates() {
    this.channel.on('presence_diff', (payload) => {
      const chatBox = document.querySelector('#chatBox');
      const leaversMessages = this.announceBandMates(
        payload.leaves,
        'has left the room'
      );
      const joinersMessages = this.announceBandMates(
        payload.joins,
        'is in da house'
      );
      chatBox.appendChild(leaversMessages);
      chatBox.appendChild(joinersMessages);
      this.presences = Presence.syncDiff(this.presences, payload);
      this.updateOnlineUsersList();
    });
  }
}

export default ChatRoom;
