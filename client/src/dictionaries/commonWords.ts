const commonWords =
  "the more sentence between of day set city to could three tree and go want cross a come air since in did well hard is my also start it sound play might you no small story that most end saw he number put far was who home sea for over read draw on know hand left are water port late with than large run as call spell don't I first add while his people even press they may land close be down here night at side must real one been big life have now high few this find such stop from any follow open or new act seem had work why together by part ask next hot take men white but get change children some place went begin what made light got there live kind walk we where off example can after need ease out back house paper other little picture often were only try always all round us music your man again those when year animal both up came point mark use show mother book word every world letter how good near until said me build mile an give self river each our earth car she under father feet which name head care do very stand second their through own group time just page carry if form should took will much country rain way great found eat about think answer room many say school friend then help grow began them low study idea would line still fish write before learn mountain like turn plant north so cause cover once these same food base her mean sun hear long differ four horse make move thought cut thing right let sure see boy keep watch him old eye color two too never face has does last wood look tell door main";

const commonWordsArray = commonWords.split(" ");
for (let i = commonWordsArray.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [commonWordsArray[i], commonWordsArray[j]] = [
    commonWordsArray[j],
    commonWordsArray[i],
  ];
}

export default commonWordsArray;
