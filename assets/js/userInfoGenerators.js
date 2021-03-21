export const userNameGenerator = () => {
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

  return `${randomSelect(adjectives)} ${randomSelect(animals)}`;
};
export const userColourGenerator = () => {
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
  return randomSelect(colours);
};

const randomSelect = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};