import * as Tone from 'tone';
import { userNameGenerator, userColourGenerator } from './userInfoGenerators';
import { revertKeyColor, updateKeyColor } from './piano';

class ChatRoom {
  constructor(socket) {
    this.userColour = userColourGenerator();
    this.socket = socket;
    this.channel = null;
    this.synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();
    this.precenses = null;
    this.init();
  }
  init() {
    document.getElementById('soundOnButton').addEventListener('click', () => {
      Tone.start();
      const userName = document.getElementById('user-name').value;
      this.channel = this.socket.channel('piano:lobby', {
        userName,
        userColour: this.userColour,
      });
      this.channel.join();
      this.handleJoined();
    });
    document.getElementById('user-name').value = userNameGenerator();

    try {
      navigator
        .requestMIDIAccess()
        .then(
          (access) => this.onMidiAccessSuccess(access),
          onMidiAccessFailure
        );
    } catch (err) {
      document.getElementById('midiDevice').innerHTML =
        'Browser does not support midi, try Chrome';
      console.log('Oopsy woopsy', err);
    }
    function onMidiAccessFailure(error) {
      console.log('Oopsy woopsy', error.code);
    }
    document.documentElement.ondragstart = function () {
      return false;
    };
    let mouseIsDown = false;
    document.documentElement.addEventListener('mousedown', function () {
      mouseIsDown = true;
    });
    document.documentElement.addEventListener('mouseup', function () {
      mouseIsDown = false;
    });

    const keyboard = document.getElementById('keyboard');
    for (let key of keyboard.children) {
      key.addEventListener('mouseover', () => {
        if (mouseIsDown) this.sendNote(key.id);
      });
      key.addEventListener('mousedown', () => {
        this.sendNote(key.id);
      });
      key.addEventListener('touchstart', () => {
        this.sendNote(key.id);
      });
      key.addEventListener('mouseleave', () => {
        this.stopNote(key.id);
      });
      key.addEventListener('mouseup', () => {
        this.stopNote(key.id);
      });
      key.addEventListener('touchend', () => {
        this.stopNote(key.id);
      });
    }
  }

  handleJoined() {
    this.getPrecenseList();
    this.listenForBandMates();
    this.listenForNotes();
  }

  handleMidiMessage(message) {
    const noteOnMidi = 144;
    const noteOffMidi = 128;
    const note = Tone.Midi(message.data[1]).toNote();

    if (message.data[0] === noteOffMidi) {
      this.stopNote(note);
    } else if (message.data[0] === noteOnMidi) {
      this.sendNote(note);
    }
  }

  onMidiAccessSuccess(access) {
    const midiAccess = access;

    const inputs = midiAccess.inputs;
    const inputIterators = inputs.values();

    const firstInput = inputIterators.next().value;

    if (!firstInput) return;
    document.getElementById('midiDevice').innerHTML = firstInput.name;

    firstInput.onmidimessage = (message) => this.handleMidiMessage(message);
  }

  sendNote(note) {
    if (this.channel) {
      const userName = document.getElementById('user-name').value;
      this.channel.push('play', {
        name: userName,
        body: { userColour: this.userColour, note },
      });
    } else {
      this.synth.triggerAttack(note, undefined, 1);
      updateKeyColor({ note, userColour: this.userColour });
    }
  }

  stopNote(note) {
    if (this.channel) {
      const userName = document.getElementById('user-name').value;
      this.channel.push('stop', { name: userName, body: { note } });
    } else {
      this.synth.triggerRelease(note, undefined, 1);
      revertKeyColor(note);
    }
  }

  listenForNotes() {
    this.channel.on('play', (payload) => {
      this.synth.triggerAttack([payload.body.note], undefined, 1);
      updateKeyColor(payload.body);
    });
    this.channel.on('stop', (payload) => {
      this.synth.triggerRelease([payload.body.note], undefined, 1);
      revertKeyColor(payload.body.note);
    });
  }

  getPrecenseList() {
    this.channel.on('presence_state', (state) => {
      let onlineUserBox = document.querySelector('#usersBox');
      let onlineUsers = document.createElement('p');
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
      let chatBox = document.querySelector('#chatBox');
      let msgBlock = document.createElement('p');
      let onlineUserBox = document.querySelector('#usersBox');
      let onlineUsers = document.createElement('p');

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
