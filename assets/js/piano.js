import * as Tone from 'tone';

let Piano = {
  init(socket) {
    const channel = socket.channel('piano:lobby', {});
    const synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();
    document.getElementById('user-name').value = this.userNameGenerator();
    const userName = document.getElementById('user-name').value;
    const userColour = this.userColourGenerator();

    channel.join();
    channel.push('newJoiner', { name: userName, body: userColour });

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
        if (mouseIsDown) this.playNote(key, channel);
      });
      key.addEventListener('mousedown', () => {
        this.playNote(key, channel);
      });
      key.addEventListener('touchstart', () => {
        this.playNote(key, channel);
      });
      key.addEventListener('mouseleave', () => {
        this.releaseNote(key, channel);
      });
      key.addEventListener('mouseup', () => {
        this.releaseNote(key, channel);
      });
      key.addEventListener('touchend', () => {
        this.releaseNote(key, channel);
      });
    }
    this.listenForBandMates(channel);
    this.listenForNotes(channel, synth);
  },

  listenForNotes(channel, synth) {
    channel.on('play', (payload) => {
      this.soundNote(synth, payload.body);
    });
    channel.on('stop', (payload) => {
      this.stopNote(synth, payload.body);
    });
  },

  listenForBandMates(channel) {
    channel.on('newJoiner', (payload) => {
      let chatBox = document.querySelector('#chat-box');
      let msgBlock = document.createElement('p');

      msgBlock.insertAdjacentHTML(
        'beforeend',
        `<p style="color:${payload.body}"><b>${payload.name}:</b> has joined the session</p>`
      );
      chatBox.appendChild(msgBlock);
    });
  },

  soundNote(synth, note) {
    synth.triggerAttack([note], undefined, 1);
  },

  stopNote(synth, note) {
    synth.triggerRelease([note], undefined, 1);
  },

  playNote(key, channel) {
    let userName = document.getElementById('user-name').value;
    channel.push('play', { name: userName, body: key.dataset.note });
    this.updateKeyColor(key, 'down');
  },

  releaseNote(key, channel) {
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
  userNameGenerator() {
    // from https://www.randomlists.com/random-adjectives
    const adjectives = [
      'forgetful',
      'zonked',
      'deranged',
      'friendly',
      'tasteless',
      'watery',
      'doubtful',
      'ripe',
      'sticky',
      'premium',
      'military',
      'bouncy',
      'disastrous',
      'tidy',
      'jobless',
      'puzzling',
      'rich',
      'humdrum',
      'lyrical',
      'horrible',
      'thoughtful',
      'silky',
    ];
    var animals = [
      'gemsbok',
      'cat',
      'ocelot',
      'ewe',
      'capybara',
      'mule',
      'rat',
      'hog',
      'jerboa',
      'goat',
      'armadillo',
      'finch',
      'pony',
      'polar bear',
      'prairie dog',
      'lemur',
    ];

    return `${this.randomSelect(adjectives)} ${this.randomSelect(animals)}`;
  },
  userColourGenerator() {
    const colours = [
      '#6F5071',
      '#B4667F',
      '#EC8777',
      '#FFBA68',
      '#F9F871',
      '#00C6C2',
      '#664D7C',
      '#935054',
    ];
    return this.randomSelect(colours);
  },
  randomSelect(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
};

export default Piano;
