import * as Tone from 'tone';

export class MidiHandler {
  constructor(piano) {
    this.piano = piano;
    this.init();
  }
  init() {
    try {
      navigator
        .requestMIDIAccess()
        .then((access) => this.onMidiAccessSuccess(access));
    } catch (err) {
      this.onMidiAccessFailure(err);
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
      this.piano.stopNote(note);
    } else if (message.data[0] === noteOnMidi) {
      this.piano.sendNote(note);
    }
  }
}
