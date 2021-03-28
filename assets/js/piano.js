import * as Tone from 'tone';

export class PianoController {
  constructor(userColour, channel) {
    this.channel = channel;
    this.userName = null;
    this.joined = false;
    this.userColour = userColour;
    this.synth = new Tone.PolySynth({ voice: Tone.Synth }).toDestination();
    this.init();
  }
  init() {
    this.startTone();
    try {
      navigator
        .requestMIDIAccess()
        .then((access) => this.onMidiAccessSuccess(access));
    } catch (err) {
      this.onMidiAccessFailure(err);
    }

    document.documentElement.ondragstart = () => {
      return false;
    };
    let mouseIsDown = false;
    document.documentElement.addEventListener('mousedown', () => {
      mouseIsDown = true;
    });
    document.documentElement.addEventListener('mouseup', () => {
      mouseIsDown = false;
    });
    const keyboard = document.getElementById('keyboard');
    for (const key of keyboard.children) {
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

  onMidiAccessSuccess(access) {
    const midiAccess = access;
    const inputs = midiAccess.inputs;
    const inputIterators = inputs.values();
    const firstInput = inputIterators.next().value;
    if (firstInput) {
      document.getElementById('midiDevice').innerHTML = firstInput.name;
      firstInput.onmidimessage = (message) => this.handleMidiMessage(message);
    }
  }

  onMidiAccessFailure(error) {
    document.getElementById('midiDevice').innerHTML =
      'Browser does not support midi, try Chrome';
    console.log('Oopsy woopsy', error.code);
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

  sendNote(note) {
    if (this.joined) {
      this.channel.push('play', {
        name: this.userName,
        body: { userColour: this.userColour, note },
      });
    } else {
      this.synth.triggerAttack(note, undefined, 1);
      this.updateKeyColor({ note, userColour: this.userColour });
    }
  }

  stopNote(note) {
    if (this.joined) {
      this.channel.push('stop', { name: this.userName, body: { note } });
    } else {
      this.synth.triggerRelease(note, undefined, 1);
      this.revertKeyColor(note);
    }
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

  setUserName(userName) {
    this.userName = userName;
  }

  joinChannel() {
    this.joined = true;
    this.channel.on('play', (payload) => {
      this.synth.triggerAttack([payload.body.note], undefined, 1);
      this.updateKeyColor(payload.body);
    });
    this.channel.on('stop', (payload) => {
      this.synth.triggerRelease([payload.body.note], undefined, 1);
      this.revertKeyColor(payload.body.note);
    });
  }

  startTone() {
    Tone.start();
  }
}
