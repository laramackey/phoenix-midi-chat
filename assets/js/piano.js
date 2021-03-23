export const revertKeyColor = (note) => {
  const key = document.getElementById(note);
  const keyColour = note.includes('#') ? '#222222' : '#CBCBCB';
  key.style.backgroundColor = keyColour;
};

export const updateKeyColor = (body) => {
  const key = document.getElementById(body.note);
  key.style.backgroundColor = body.userColour;
};
