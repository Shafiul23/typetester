const commonWords =
  "the of a to you was are they from have one what were there your their said do many some would other into two could been who people only find water very words where most through any another come work word does put different again old great should give something thought both often together don’t world want";

const commonWordsArray = commonWords.split(" ");
for (let i = commonWordsArray.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [commonWordsArray[i], commonWordsArray[j]] = [
    commonWordsArray[j],
    commonWordsArray[i],
  ];
}

export default commonWordsArray;
