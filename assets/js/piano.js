import * as Tone from 'tone';

let Piano = {
  init(socket) {
    let channel = socket.channel('piano:lobby', {});
    channel.join();
    this.listenForChats(channel);

    document.documentElement.ondragstart = function () {
      return false;
    };
    var mouse_IsDown = false;
    document.documentElement.addEventListener('mousedown', function () {
      mouse_IsDown = true;
    });
    document.documentElement.addEventListener('mouseup', function () {
      mouse_IsDown = false;
    });

    const synth = new Tone.PolySynth({ voice: Tone.Synth }).toMaster();
    function update_KeyColor(key, keyState) {
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
    }

    function play_Note(key) {
      let userName = document.getElementById('user-name').value;
      channel.push('shout', { name: userName, body: key.dataset.note });
      synth.triggerAttack([key.dataset.note], undefined, 1);
      update_KeyColor(key, 'down');
    }
    function release_Note(key) {
      synth.triggerRelease([key.dataset.note], undefined);
      update_KeyColor(key, 'up');
    }

    var keyboard = document.getElementById('keyboard');
    for (let key of keyboard.children) {
      key.addEventListener('mouseover', () => {
        if (mouse_IsDown) play_Note(key);
      });
      key.addEventListener('mousedown', () => {
        play_Note(key);
      });
      key.addEventListener('touchstart', () => {
        play_Note(key);
      });
      key.addEventListener('mouseleave', () => {
        release_Note(key);
      });
      key.addEventListener('mouseup', () => {
        release_Note(key);
      });
      key.addEventListener('touchend', () => {
        release_Note(key);
      });
    }
  },

  listenForChats(channel) {
    channel.on('shout', (payload) => {
      let chatBox = document.querySelector('#chat-box');
      let msgBlock = document.createElement('p');

      msgBlock.insertAdjacentHTML(
        'beforeend',
        `<b>${payload.name}:</b> ${payload.body}`
      );
      chatBox.appendChild(msgBlock);
    });
  },
};

export default Piano;
