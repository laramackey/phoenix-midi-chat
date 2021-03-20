import * as Tone from 'tone';

let Piano = {
  init(socket) {
    const channel = socket.channel('piano:lobby', {});
    const synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();

    channel.join();

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
        if (mouseIsDown) this.playNote(synth, key, channel);
      });
      key.addEventListener('mousedown', () => {
        this.playNote(synth, key, channel);
      });
      key.addEventListener('touchstart', () => {
        this.playNote(synth, key, channel);
      });
      key.addEventListener('mouseleave', () => {
        this.releaseNote(synth, key, channel);
      });
      key.addEventListener('mouseup', () => {
        this.releaseNote(synth, key, channel);
      });
      key.addEventListener('touchend', () => {
        this.releaseNote(synth, key, channel);
      });
    }
    this.listenForChats(channel, synth);
  },

  listenForChats(channel, synth) {
    channel.on('play', (payload) => {
      let chatBox = document.querySelector('#chat-box');
      let msgBlock = document.createElement('p');

      msgBlock.insertAdjacentHTML(
        'beforeend',
        `<b>${payload.name}:</b> ${payload.body}`
      );
      chatBox.appendChild(msgBlock);

      this.soundNote(synth, payload.body);
    });
    channel.on('stop', (payload) => {
      this.stopNote(synth, payload.body);
    });
  },

  soundNote(synth, note) {
    synth.triggerAttack([note], undefined, 1);
  },

  stopNote(synth, note) {
    synth.triggerRelease([note], undefined, 1);
  },

  playNote(synth, key, channel) {
    let userName = document.getElementById('user-name').value;
    channel.push('play', { name: userName, body: key.dataset.note });
    this.updateKeyColor(key, 'down');
  },

  releaseNote(synth, key, channel) {
    let userName = document.getElementById('user-name').value;
    channel.push('stop', { name: userName, body: key.dataset.note });
    this.updateKeyColor(key, 'up');
  },

  updateKeyColor(key, keyState) {
    let keyColor = key.matches('.white') ? 'white' : 'black';
    if (keyColor == 'white' && keyState == 'up') {
      key.style.backgroundColor = '#CBCBCB';
    } else if (keyColor == 'white' && keyState == 'down') {
      key.style.backgroundColor = '#BBBBDD';
    } else if (keyColor == 'black' && keyState == 'up') {
      key.style.backgroundColor = '#222222';
    } else if (keyColor == 'black' && keyState == 'down') {
      key.style.backgroundColor = '#666699';
    }
  },
};

export default Piano;
