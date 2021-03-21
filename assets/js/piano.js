import * as Tone from 'tone';
import { userNameGenerator, userColourGenerator } from './userInfoGenerators';

class Piano {
  constructor(socket) {
    this.userColour = userColourGenerator();
    this.socket = socket;
    this.channel = null;
    this.synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();
    this.init();
  }
  init() {
    document.getElementById('soundOnButton').addEventListener('click', () => {
      Tone.start();
      const userName = document.getElementById('user-name').value;
      this.channel = this.socket.channel('piano:lobby', userName);
      this.channel.join();
      this.channel.push('newJoiner', {
        name: userName,
        body: { userColour: this.userColour },
      });
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
  }

  handleJoined() {
    this.channel.on('presence_diff', (payload) => {
      console.dir(payload);
    });

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
    this.listenForBandMates();
    this.listenForNotes();
  }

  handleMidiMessage(message) {
    console.log(message.data);
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
    const userName = document.getElementById('user-name').value;
    this.channel.push('play', {
      name: userName,
      body: { userColour: this.userColour, note },
    });
  }

  stopNote(note) {
    let userName = document.getElementById('user-name').value;
    this.channel.push('stop', { name: userName, body: { note } });
  }

  listenForNotes() {
    this.channel.on('play', (payload) => {
      this.synth.triggerAttack([payload.body.note], undefined, 1);
      this.updateKeyColor(payload.body);
    });
    this.channel.on('stop', (payload) => {
      this.synth.triggerRelease([payload.body.note], undefined, 1);
      this.revertKeyColor(payload.body.note);
    });
  }

  listenForBandMates() {
    this.channel.on('newJoiner', (payload) => {
      let chatBox = document.querySelector('#chat-box');
      let msgBlock = document.createElement('p');

      msgBlock.insertAdjacentHTML(
        'beforeend',
        `<p style="color:${payload.body.userColour}"><b>${payload.name}:</b> has joined the session</p>`
      );
      chatBox.appendChild(msgBlock);
    });
  }

  revertKeyColor(note) {
    const key = document.getElementById(note);
    const keyColour = note.includes('#') ? '#222222' : '#CBCBCB';
    key.style.backgroundColor = keyColour;
  }

  updateKeyColor(body) {
    const key = document.getElementById(body.note);
    key.style.backgroundColor = body.userColour;
  }
}

export default Piano;
