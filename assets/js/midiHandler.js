import * as Tone from 'tone';

export class MidiHandler {
  constructor(piano) {
    this.piano = piano;
    this.midiAccess = null;
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
    document
      .getElementById('selectMidiDevice')
      .addEventListener('change', () => {
        const selectedDevice = document.getElementById('selectMidiDevice')
          .value;
        const inputs = this.midiAccess.inputs.values();
        for (
          let input = inputs.next();
          input && !input.done;
          input = inputs.next()
        )
          if (input.value.name === selectedDevice) {
            input.value.onmidimessage = (message) =>
              this.handleMidiMessage(message);
          } else {
            input.value.onmidimessage = '';
          }
      });
  }

  onMidiAccessSuccess(access) {
    this.midiAccess = access;
    if (access.inputs && access.inputs.size > 0) {
      const inputs = access.inputs.values();
      for (
        let input = inputs.next();
        input && !input.done;
        input = inputs.next()
      ) {
        const opt = document.createElement('option');
        opt.text = input.value.name;
        document.getElementById('selectMidiDevice').add(opt);
      }
    }

    access.onstatechange = (e) => {
      const midiDropdown = document.getElementById('selectMidiDevice');
      const currentOptions = Array.from(midiDropdown.options).map(
        (option) => option.value
      );
      if (
        e.port.state === 'connected' &&
        !currentOptions.includes(e.port.name)
      ) {
        const opt = document.createElement('option');
        opt.text = e.port.name;
        midiDropdown.add(opt);
      }
      if (
        e.port.state === 'disconnected' &&
        currentOptions.includes(e.port.name)
      ) {
        const disconnectedDeviceIndex = currentOptions.indexOf(e.port.name);
        midiDropdown.remove(disconnectedDeviceIndex);
      }
    };
  }

  onMidiAccessFailure(error) {
    document.getElementById('midiInfo').innerHTML =
      'Please use Google Chrome if you would like to use a MIDI device.';
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
