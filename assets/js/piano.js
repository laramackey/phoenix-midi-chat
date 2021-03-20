import * as Tone from 'tone';
import { userNameGenerator, userColourGenerator } from './userInfoGenerators';

let Piano = {
  init(socket) {
    const channel = socket.channel('piano:lobby', {});
    const synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();
    document.getElementById('user-name').value = userNameGenerator();
    const userName = document.getElementById('user-name').value;
    const userColour = userColourGenerator();

    channel.join();
    channel.push('newJoiner', { name: userName, body: { userColour } });

    document.documentElement.ondragstart = function () {
      return false;
    };
    var mouseIsDown = false;
    document.documentElement.addEventListener('mousedown', function () {
      mouseIsDown = true;
    });
    document.documentElement.addEventListener('mouseup', function () {
      mouseIsDown = false;
    });

    var keyboard = document.getElementById('keyboard');
    for (let key of keyboard.children) {
      key.addEventListener('mouseover', () => {
        if (mouseIsDown) this.sendNote(key, channel);
      });
      key.addEventListener('mousedown', () => {
        this.sendNote(key, channel, userColour);
      });
      key.addEventListener('touchstart', () => {
        this.sendNote(key, channel, userColour);
      });
      key.addEventListener('mouseleave', () => {
        this.stopNote(key, channel);
      });
      key.addEventListener('mouseup', () => {
        this.stopNote(key, channel);
      });
      key.addEventListener('touchend', () => {
        this.stopNote(key, channel);
      });
    }
    this.listenForBandMates(channel);
    this.listenForNotes(channel, synth);
  },

  sendNote(key, channel, userColour) {
    const userName = document.getElementById('user-name').value;
    channel.push('play', {
      name: userName,
      body: { userColour, note: key.id },
    });
  },

  stopNote(key, channel) {
    let userName = document.getElementById('user-name').value;
    channel.push('stop', { name: userName, body: { note: key.id } });
  },

  listenForNotes(channel, synth) {
    channel.on('play', (payload) => {
      synth.triggerAttack([payload.body.note], undefined, 1);
      this.updateKeyColor(payload.body);
    });
    channel.on('stop', (payload) => {
      synth.triggerRelease([payload.body.note], undefined, 1);
      this.revertKeyColor(payload.body.note);
    });
  },

  listenForBandMates(channel) {
    channel.on('newJoiner', (payload) => {
      let chatBox = document.querySelector('#chat-box');
      let msgBlock = document.createElement('p');

      msgBlock.insertAdjacentHTML(
        'beforeend',
        `<p style="color:${payload.body.userColour}"><b>${payload.name}:</b> has joined the session</p>`
      );
      chatBox.appendChild(msgBlock);
    });
  },

  revertKeyColor(note) {
    const key = document.getElementById(note);
    const keyColour = note.includes('#') ? '#222222' : '#CBCBCB';
    key.style.backgroundColor = keyColour;
  },

  updateKeyColor(body) {
    const key = document.getElementById(body.note);
    key.style.backgroundColor = body.userColour;
  },
};

export default Piano;
