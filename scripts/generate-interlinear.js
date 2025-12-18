/**
 * USFM to Interlinear TSV Generator
 *
 * Parses USFM Bible files and generates interlinear German-English translations
 * Output format: ref<TAB>word1|gloss1 word2|gloss2 ... (one verse per line)
 */

const fs = require('fs');
const path = require('path');

// German to English dictionary for common biblical words
const GERMAN_ENGLISH_DICT = {
  // Common words
  'und': 'AND',
  'Und': 'AND',
  'der': 'THE',
  'die': 'THE',
  'das': 'THE',
  'den': 'THE',
  'dem': 'THE',
  'des': 'OF-THE',
  'ein': 'A',
  'eine': 'A',
  'einen': 'A',
  'einem': 'A',
  'einer': 'A',
  'von': 'FROM',
  'auf': 'ON',
  'zu': 'TO',
  'mit': 'WITH',
  'in': 'IN',
  'im': 'IN-THE',
  'ist': 'IS',
  'war': 'WAS',
  'ward': 'BECAME',
  'es': 'IT',
  'er': 'HE',
  'sie': 'SHE/THEY',
  'ihn': 'HIM',
  'ihm': 'HIM',
  'ihr': 'HER/THEIR',
  'ihnen': 'THEM',
  'sich': 'ITSELF',
  'nicht': 'NOT',
  'nach': 'AFTER',
  'an': 'AT',
  'aus': 'FROM/OUT',
  'bei': 'BY',
  'vor': 'BEFORE',
  'als': 'AS/WHEN',
  'auch': 'ALSO',
  'aber': 'BUT',
  'da': 'THEN/THERE',
  'Da': 'THEN/THERE',
  'so': 'SO',
  'wenn': 'WHEN/IF',
  'denn': 'FOR/BECAUSE',
  'daß': 'THAT',
  'was': 'WHAT',
  'wer': 'WHO',
  'wo': 'WHERE',
  'wie': 'HOW',
  'nur': 'ONLY',
  'noch': 'STILL/YET',
  'schon': 'ALREADY',
  'über': 'OVER',
  'unter': 'UNDER',
  'zwischen': 'BETWEEN',
  'durch': 'THROUGH',
  'für': 'FOR',
  'gegen': 'AGAINST',
  'ohne': 'WITHOUT',
  'bis': 'UNTIL',
  'seit': 'SINCE',
  'während': 'DURING',
  'wegen': 'BECAUSE-OF',
  'trotz': 'DESPITE',
  'außer': 'EXCEPT',
  'sein': 'HIS/TO-BE',
  'seine': 'HIS',
  'seinen': 'HIS',
  'seinem': 'HIS',
  'seiner': 'HIS',
  'ihr': 'HER/THEIR',
  'ihre': 'HER/THEIR',
  'ihren': 'HER/THEIR',
  'ihrem': 'HER/THEIR',
  'ihrer': 'HER/THEIR',
  'mein': 'MY',
  'meine': 'MY',
  'dein': 'YOUR',
  'deine': 'YOUR',
  'unser': 'OUR',
  'unsere': 'OUR',
  'euer': 'YOUR',
  'eure': 'YOUR',
  'dieser': 'THIS',
  'diese': 'THIS',
  'dieses': 'THIS',
  'jener': 'THAT',
  'jene': 'THAT',
  'jenes': 'THAT',
  'welcher': 'WHICH',
  'welche': 'WHICH',
  'welches': 'WHICH',
  'alle': 'ALL',
  'allen': 'ALL',
  'allem': 'ALL',
  'aller': 'ALL',
  'alles': 'ALL/EVERYTHING',
  'allerlei': 'ALL-KINDS-OF',
  'einige': 'SOME',
  'manche': 'SOME',
  'viele': 'MANY',
  'wenige': 'FEW',
  'andere': 'OTHER',
  'jeder': 'EACH/EVERY',
  'jede': 'EACH/EVERY',
  'jedes': 'EACH/EVERY',
  'kein': 'NO/NONE',
  'keine': 'NO/NONE',
  'selbst': 'SELF',

  // Numbers
  'erste': 'FIRST',
  'ersten': 'FIRST',
  'erster': 'FIRST',
  'zweite': 'SECOND',
  'zweiten': 'SECOND',
  'dritte': 'THIRD',
  'dritten': 'THIRD',
  'vierte': 'FOURTH',
  'vierten': 'FOURTH',
  'fünfte': 'FIFTH',
  'fünften': 'FIFTH',
  'sechste': 'SIXTH',
  'sechsten': 'SIXTH',
  'siebente': 'SEVENTH',
  'siebenten': 'SEVENTH',
  'siebte': 'SEVENTH',
  'siebten': 'SEVENTH',
  'siebenten': 'SEVENTH',
  'siebenter': 'SEVENTH',
  'achte': 'EIGHTH',
  'neunte': 'NINTH',
  'zehnte': 'TENTH',
  'zwei': 'TWO',
  'drei': 'THREE',
  'vier': 'FOUR',
  'fünf': 'FIVE',
  'sechs': 'SIX',
  'sieben': 'SEVEN',
  'acht': 'EIGHT',
  'neun': 'NINE',
  'zehn': 'TEN',
  'elf': 'ELEVEN',
  'zwölf': 'TWELVE',
  'hundert': 'HUNDRED',
  'tausend': 'THOUSAND',

  // Verbs
  'sprach': 'SPOKE',
  'sah': 'SAW',
  'machte': 'MADE',
  'schuf': 'CREATED',
  'nannte': 'CALLED',
  'setzte': 'SET',
  'gab': 'GAVE',
  'nahm': 'TOOK',
  'kam': 'CAME',
  'ging': 'WENT',
  'brachte': 'BROUGHT',
  'führte': 'LED',
  'ließ': 'LET',
  'hörte': 'HEARD',
  'wußte': 'KNEW',
  'konnte': 'COULD',
  'wollte': 'WANTED',
  'sollte': 'SHOULD',
  'mußte': 'HAD-TO',
  'hatte': 'HAD',
  'sein': 'BE',
  'haben': 'HAVE',
  'werden': 'BECOME',
  'können': 'CAN',
  'müssen': 'MUST',
  'sollen': 'SHALL',
  'wollen': 'WANT',
  'dürfen': 'MAY',
  'gehen': 'GO',
  'kommen': 'COME',
  'sehen': 'SEE',
  'geben': 'GIVE',
  'nehmen': 'TAKE',
  'sprechen': 'SPEAK',
  'machen': 'MAKE',
  'sagen': 'SAY',
  'wissen': 'KNOW',
  'denken': 'THINK',
  'glauben': 'BELIEVE',
  'leben': 'LIVE',
  'sterben': 'DIE',
  'essen': 'EAT',
  'trinken': 'DRINK',
  'schlafen': 'SLEEP',
  'arbeiten': 'WORK',
  'lieben': 'LOVE',
  'hassen': 'HATE',
  'fürchten': 'FEAR',
  'hoffen': 'HOPE',
  'wünschen': 'WISH',
  'segnete': 'BLESSED',
  'segnen': 'BLESS',
  'herrsche': 'RULE',
  'herrschen': 'RULE',
  'herrscht': 'RULES',
  'herrschte': 'RULED',
  'heißen': 'BE-CALLED',
  'heißt': 'IS-CALLED',
  'hieß': 'WAS-CALLED',
  'werde': 'BECOME',
  'werdest': 'BECOME',
  'wurden': 'BECAME',
  'schied': 'SEPARATED',
  'scheiden': 'SEPARATE',
  'sammle': 'GATHER',
  'sammeln': 'GATHER',
  'sehe': 'SEE',
  'siehst': 'SEE',
  'sieht': 'SEES',
  'regiere': 'RULE',
  'regiert': 'RULES',
  'regierten': 'RULED',
  'scheinen': 'SHINE',
  'scheint': 'SHINES',
  'schienen': 'SHONE',
  'errege': 'SWARM',
  'fliege': 'FLY',
  'fliegen': 'FLY',
  'fliegt': 'FLIES',
  'bringe': 'BRING',
  'bringen': 'BRING',
  'bringt': 'BRINGS',
  'kriecht': 'CREEPS',
  'kriechen': 'CREEP',
  'mehre': 'MULTIPLY',
  'mehrt': 'MULTIPLY',
  'mehren': 'MULTIPLY',
  'füllt': 'FILL',
  'füllen': 'FILL',
  'erfüllt': 'FILL',
  'erfüllen': 'FILL',
  'besamt': 'SEEDS',
  'besame': 'SEED',
  'besamte': 'SEEDED',
  'besamen': 'SEED',
  'trage': 'BEAR',
  'tragen': 'BEAR',
  'trägt': 'BEARS',
  'trugen': 'BORE',
  'aufgehen': 'SPRING-UP',
  'lasse': 'LET',
  'lassen': 'LET',
  'läßt': 'LETS',
  'vollendet': 'COMPLETED',
  'vollendete': 'COMPLETED',
  'vollenden': 'COMPLETE',
  'ruhte': 'RESTED',
  'ruhen': 'REST',
  'ruht': 'RESTS',
  'heiligte': 'SANCTIFIED',
  'heiligen': 'SANCTIFY',
  'geruht': 'RESTED',
  'geschaffen': 'CREATED',
  'geworden': 'BECAME',
  'gewachsen': 'GROWN',
  'regnen': 'RAIN',
  'baute': 'CULTIVATED',
  'bauen': 'BUILD/CULTIVATE',
  'baut': 'BUILDS',
  'feuchtete': 'WATERED',
  'blies': 'BREATHED',
  'blasen': 'BLOW',
  'pflanzte': 'PLANTED',
  'pflanzen': 'PLANT',
  'aufwachsen': 'GROW-UP',
  'anzusehen': 'TO-LOOK-AT',
  'erkannte': 'KNEW',
  'erkennen': 'KNOW',
  'gebar': 'BORE',
  'gebären': 'BEAR',
  'zeugte': 'BEGOT',
  'zeugen': 'BEGET',
  'lebte': 'LIVED',
  'starb': 'DIED',
  'wandelte': 'WALKED',
  'wandeln': 'WALK',
  'fand': 'FOUND',
  'finden': 'FIND',
  'findet': 'FINDS',
  'baute': 'BUILT',
  'nannten': 'CALLED',
  'zeugten': 'BEGOT',
  'waren': 'WERE',

  // Biblical/theological terms
  'Gott': 'GOD',
  'Gottes': 'OF-GOD',
  'HERR': 'LORD',
  'HERRN': 'LORD',
  'Himmel': 'HEAVEN',
  'Himmels': 'OF-HEAVEN',
  'Erde': 'EARTH',
  'Erden': 'EARTH',
  'Wasser': 'WATER',
  'Wassern': 'WATERS',
  'Licht': 'LIGHT',
  'Lichter': 'LIGHTS',
  'Finsternis': 'DARKNESS',
  'Tag': 'DAY',
  'Tage': 'DAYS',
  'Tagen': 'DAYS',
  'Tages': 'OF-DAY',
  'Nacht': 'NIGHT',
  'Abend': 'EVENING',
  'Morgen': 'MORNING',
  'Sonne': 'SUN',
  'Mond': 'MOON',
  'Sterne': 'STARS',
  'Stern': 'STAR',
  'Meer': 'SEA',
  'Meere': 'SEAS',
  'Feste': 'FIRMAMENT',
  'Geist': 'SPIRIT',
  'Seele': 'SOUL',
  'Leben': 'LIFE',
  'Lebens': 'OF-LIFE',
  'Tod': 'DEATH',
  'Todes': 'OF-DEATH',
  'Mensch': 'MAN/HUMAN',
  'Menschen': 'MAN/HUMANS',
  'Mann': 'MAN',
  'Mannes': 'OF-MAN',
  'Manne': 'MAN',
  'Männer': 'MEN',
  'Weib': 'WOMAN',
  'Weibes': 'OF-WOMAN',
  'Weibe': 'WOMAN',
  'Weiber': 'WOMEN',
  'Frau': 'WOMAN/WIFE',
  'Sohn': 'SON',
  'Sohne': 'SON',
  'Sohnes': 'OF-SON',
  'Söhne': 'SONS',
  'Söhnen': 'SONS',
  'Tochter': 'DAUGHTER',
  'Töchter': 'DAUGHTERS',
  'Vater': 'FATHER',
  'Vaters': 'OF-FATHER',
  'Väter': 'FATHERS',
  'Mutter': 'MOTHER',
  'Kind': 'CHILD',
  'Kinder': 'CHILDREN',
  'Bruder': 'BROTHER',
  'Bruders': 'OF-BROTHER',
  'Brüder': 'BROTHERS',
  'Schwester': 'SISTER',
  'König': 'KING',
  'Könige': 'KINGS',
  'Königs': 'OF-KING',
  'Knecht': 'SERVANT',
  'Knechte': 'SERVANTS',
  'Magd': 'MAID',
  'Mägde': 'MAIDS',
  'Volk': 'PEOPLE',
  'Volke': 'PEOPLE',
  'Volkes': 'OF-PEOPLE',
  'Völker': 'PEOPLES/NATIONS',
  'Völkern': 'PEOPLES/NATIONS',
  'Land': 'LAND',
  'Lande': 'LAND',
  'Landes': 'OF-LAND',
  'Länder': 'LANDS',
  'Stadt': 'CITY',
  'Städte': 'CITIES',
  'Haus': 'HOUSE',
  'Hause': 'HOUSE',
  'Hauses': 'OF-HOUSE',
  'Häuser': 'HOUSES',
  'Berg': 'MOUNTAIN',
  'Berge': 'MOUNTAINS',
  'Tal': 'VALLEY',
  'Täler': 'VALLEYS',
  'Fluß': 'RIVER',
  'Flüsse': 'RIVERS',
  'Strom': 'STREAM',
  'Baum': 'TREE',
  'Bäume': 'TREES',
  'Bäumen': 'TREES',
  'Gras': 'GRASS',
  'Kraut': 'HERB/PLANT',
  'Frucht': 'FRUIT',
  'Früchte': 'FRUITS',
  'Früchten': 'FRUITS',
  'Samen': 'SEED',
  'Garten': 'GARDEN',
  'Tier': 'ANIMAL',
  'Tiere': 'ANIMALS',
  'Tieren': 'ANIMALS',
  'Vieh': 'CATTLE/LIVESTOCK',
  'Vogel': 'BIRD',
  'Vögel': 'BIRDS',
  'Vögeln': 'BIRDS',
  'Gevögel': 'BIRDS',
  'Fisch': 'FISH',
  'Fische': 'FISH',
  'Fischen': 'FISH',
  'Gewürm': 'CREEPING-THINGS',
  'Schlange': 'SERPENT',
  'Walfische': 'SEA-CREATURES',
  'Getier': 'CREATURE',
  'Gefieder': 'BIRDS',

  // Nature terms
  'wüst': 'FORMLESS',
  'leer': 'VOID',
  'finster': 'DARK',
  'Tiefe': 'DEEP',
  'schwebte': 'HOVERED',
  'gut': 'GOOD',
  'Guten': 'GOOD',
  'böse': 'EVIL',
  'Bösen': 'EVIL',
  'groß': 'GREAT',
  'große': 'GREAT',
  'großes': 'GREAT',
  'großen': 'GREAT',
  'großer': 'GREAT',
  'klein': 'SMALL',
  'kleine': 'SMALL',
  'kleines': 'SMALL',
  'kleinen': 'SMALL',
  'kleiner': 'SMALL',
  'hoch': 'HIGH',
  'hohe': 'HIGH',
  'hohen': 'HIGH',
  'tief': 'DEEP',
  'tiefe': 'DEEP',
  'tiefen': 'DEEP',
  'neu': 'NEW',
  'neue': 'NEW',
  'neuen': 'NEW',
  'alt': 'OLD',
  'alte': 'OLD',
  'alten': 'OLD',
  'jung': 'YOUNG',
  'junge': 'YOUNG',
  'jungen': 'YOUNG',
  'schön': 'BEAUTIFUL',
  'schöne': 'BEAUTIFUL',
  'schönen': 'BEAUTIFUL',
  'heilig': 'HOLY',
  'heilige': 'HOLY',
  'heiligen': 'HOLY',
  'rein': 'PURE/CLEAN',
  'reine': 'PURE/CLEAN',
  'unrein': 'UNCLEAN',
  'gerecht': 'RIGHTEOUS',
  'gerechte': 'RIGHTEOUS',
  'recht': 'RIGHT',
  'rechte': 'RIGHT',
  'rechten': 'RIGHT',
  'böse': 'EVIL',
  'lustig': 'PLEASANT',
  'fruchtbar': 'FRUITFUL',
  'fruchtbare': 'FRUITFUL',
  'lebendige': 'LIVING',
  'lebendigen': 'LIVING',
  'lebendiger': 'LIVING',
  'lebendig': 'LIVING',
  'webenden': 'SWARMING',
  'gefiedertes': 'WINGED',
  'grünes': 'GREEN',
  'grüne': 'GREEN',
  'Trockene': 'DRY-LAND',
  'besondere': 'PARTICULAR',

  // Place names and proper nouns
  'Eden': 'EDEN',
  'Adam': 'ADAM',
  'Eva': 'EVE',
  'Kain': 'CAIN',
  'Abel': 'ABEL',
  'Seth': 'SETH',
  'Henoch': 'ENOCH',
  'Noah': 'NOAH',
  'Noahs': 'OF-NOAH',
  'Sem': 'SHEM',
  'Ham': 'HAM',
  'Japhet': 'JAPHETH',
  'Abraham': 'ABRAHAM',
  'Abrahams': 'OF-ABRAHAM',
  'Isaak': 'ISAAC',
  'Jakob': 'JACOB',
  'Israel': 'ISRAEL',
  'Ägypten': 'EGYPT',

  // Body parts
  'Hand': 'HAND',
  'Hände': 'HANDS',
  'Fuß': 'FOOT',
  'Füße': 'FEET',
  'Auge': 'EYE',
  'Augen': 'EYES',
  'Ohr': 'EAR',
  'Ohren': 'EARS',
  'Mund': 'MOUTH',
  'Mundes': 'OF-MOUTH',
  'Herz': 'HEART',
  'Herzen': 'HEART',
  'Herzens': 'OF-HEART',
  'Haupt': 'HEAD',
  'Kopf': 'HEAD',
  'Bein': 'BONE/LEG',
  'Beine': 'BONES/LEGS',
  'Fleisch': 'FLESH',
  'Blut': 'BLOOD',
  'Blutes': 'OF-BLOOD',
  'Odem': 'BREATH',
  'Nase': 'NOSE',
  'Rippe': 'RIB',
  'Rippen': 'RIBS',

  // Actions and abstract concepts
  'Anfang': 'BEGINNING',
  'Ende': 'END',
  'Werk': 'WORK',
  'Werke': 'WORKS',
  'Werken': 'WORKS',
  'Tat': 'DEED',
  'Taten': 'DEEDS',
  'Wort': 'WORD',
  'Worte': 'WORDS',
  'Worten': 'WORDS',
  'Wortes': 'OF-WORD',
  'Name': 'NAME',
  'Namen': 'NAME',
  'Namens': 'OF-NAME',
  'Stimme': 'VOICE',
  'Zeichen': 'SIGN',
  'Zeit': 'TIME',
  'Zeiten': 'TIMES',
  'Jahr': 'YEAR',
  'Jahre': 'YEARS',
  'Jahren': 'YEARS',
  'Erkenntnis': 'KNOWLEDGE',
  'Unterschied': 'SEPARATION',
  'Sammlung': 'GATHERING',
  'Art': 'KIND',
  'Örter': 'PLACES',
  'Heer': 'HOST',
  'Bild': 'IMAGE',
  'Bilde': 'IMAGE',
  'Segen': 'BLESSING',
  'Fluch': 'CURSE',
  'Speise': 'FOOD',
  'Schmerzen': 'PAIN',
  'Verlangen': 'DESIRE',
  'Gehilfin': 'HELPER',
  'Schlaf': 'SLEEP',
  'Stätte': 'PLACE',
  'Weg': 'WAY',

  // Miscellaneous
  'also': 'THUS/SO',
  'Also': 'THUS/SO',
  'siehe': 'BEHOLD',
  'Siehe': 'BEHOLD',
  'Seht': 'SEE',
  'sehr': 'VERY',
  'ganz': 'WHOLE',
  'ganze': 'WHOLE',
  'ganzen': 'WHOLE',
  'ganzer': 'WHOLE',
  'jeglicher': 'EACH',
  'jegliches': 'EACH',
  'jeglichem': 'EACH',
  'gleichwie': 'JUST-AS',
  'gleich': 'LIKE',
  'mitten': 'MIDST',
  'eigenen': 'OWN',
  'eigener': 'OWN',
  'geschah': 'HAPPENED',
  'geschehen': 'HAPPEN',
  'geschieht': 'HAPPENS',
  'darum': 'THEREFORE',
  'daher': 'THEREFORE',
  'deshalb': 'THEREFORE',
  'dieweil': 'BECAUSE',
  'doch': 'YET/STILL',
  'nun': 'NOW',
  'wohl': 'WELL',
  'solches': 'SUCH',
  'solche': 'SUCH',
  'solchen': 'SUCH',
  'ihrem': 'THEIR',
  'ihres': 'THEIR',
  'euch': 'YOU',
  'euer': 'YOUR',
  'eurer': 'YOUR',
  'uns': 'US',
  'unserer': 'OUR',
  'mich': 'ME',
  'mir': 'ME',
  'meiner': 'MY',
  'dich': 'YOU',
  'dir': 'YOU',
  'deiner': 'YOUR',
  'ihnen': 'THEM',
  'welches': 'WHICH',
  'davon': 'THEREOF',
  'worin': 'WHEREIN',
  'wozu': 'WHERETO',
  'hierin': 'HEREIN',
  'dabei': 'THEREBY',
  'dadurch': 'THEREBY',
  'daran': 'THEREON',
  'darin': 'THEREIN',
  'darauf': 'THEREUPON',
  'daraus': 'THEREFROM',
  'dahin': 'THITHER',
  'daher': 'THENCE',
  'hinein': 'INTO',
  'hinauf': 'UP',
  'hinab': 'DOWN',
  'heraus': 'OUT',
  'herab': 'DOWN',
  'herauf': 'UP',
  'herein': 'IN',
  'Laßt': 'LET',
  'laßt': 'LET',
  'Seid': 'BE',
  'seid': 'BE',
  'habe': 'HAVE',
  'hast': 'HAVE',
  'hat': 'HAS',
  'habt': 'HAVE',
  'haben': 'HAVE',
  'gegeben': 'GIVEN',
  'untertan': 'SUBJECT',
  'gemacht': 'MADE',
  'lebt': 'LIVES',
  'webt': 'MOVES',
  'erregte': 'SWARMED',
  'Nebel': 'MIST',
  'Erdenkloß': 'DUST-OF-GROUND',
  'demselben': 'THE-SAME',
  'daselbst': 'THERE',
};

/**
 * Parse USFM file and extract verses for specified chapters
 * @param {string} content - USFM file content
 * @param {number} startChapter - Starting chapter number
 * @param {number} endChapter - Ending chapter number
 * @returns {Array} Array of verse objects
 */
function parseUSFM(content, startChapter, endChapter) {
  const verses = [];
  const lines = content.split('\n');
  let currentChapter = 0;
  let currentVerse = '';
  let currentVerseNum = 0;
  let inTargetRange = false;

  for (const line of lines) {
    // Check for chapter marker
    const chapterMatch = line.match(/^\\c\s+(\d+)/);
    if (chapterMatch) {
      // Save previous verse if exists
      if (currentVerse && inTargetRange) {
        verses.push({
          chapter: currentChapter,
          verse: currentVerseNum,
          text: currentVerse.trim()
        });
        currentVerse = '';
      }

      currentChapter = parseInt(chapterMatch[1], 10);
      inTargetRange = currentChapter >= startChapter && currentChapter <= endChapter;
      continue;
    }

    // Check for verse marker
    const verseMatch = line.match(/^\\v\s+(\d+)\s*(.*)/);
    if (verseMatch && inTargetRange) {
      // Save previous verse if exists
      if (currentVerse) {
        verses.push({
          chapter: currentChapter,
          verse: currentVerseNum,
          text: currentVerse.trim()
        });
      }

      currentVerseNum = parseInt(verseMatch[1], 10);
      currentVerse = verseMatch[2] || '';
      continue;
    }

    // Skip paragraph markers and other non-text content
    if (line.startsWith('\\p') || line.startsWith('\\') && !line.includes('\\w')) {
      continue;
    }

    // Append to current verse if in range
    if (inTargetRange && currentVerseNum > 0) {
      currentVerse += ' ' + line;
    }
  }

  // Save last verse
  if (currentVerse && inTargetRange) {
    verses.push({
      chapter: currentChapter,
      verse: currentVerseNum,
      text: currentVerse.trim()
    });
  }

  return verses;
}

/**
 * Extract words from USFM text
 * @param {string} text - USFM verse text
 * @returns {Array} Array of word objects
 */
function extractWords(text) {
  const words = [];

  // Pattern to match \w word|strong="HXXXX"\w* format
  const wordPattern = /\\w\s+([^|]+)\|strong="([^"]+)"\\w\*/g;

  // First, handle annotated words
  let lastIndex = 0;
  let match;

  while ((match = wordPattern.exec(text)) !== null) {
    // Extract any plain text before this word
    const before = text.slice(lastIndex, match.index);
    const plainWords = extractPlainWords(before);
    words.push(...plainWords);

    // Add the annotated word
    words.push({
      word: match[1].trim(),
      strong: match[2],
      annotated: true
    });

    lastIndex = wordPattern.lastIndex;
  }

  // Extract any remaining plain text
  const remaining = text.slice(lastIndex);
  const plainWords = extractPlainWords(remaining);
  words.push(...plainWords);

  return words;
}

/**
 * Extract plain (non-annotated) words from text
 * @param {string} text - Plain text
 * @returns {Array} Array of word objects
 */
function extractPlainWords(text) {
  const words = [];

  // Remove USFM markers and clean up
  text = text.replace(/\\[a-z]+\*/g, ''); // Remove closing markers
  text = text.replace(/\\[a-z]+/g, '');   // Remove opening markers

  // Split by whitespace and punctuation, keeping punctuation
  const tokens = text.split(/(\s+|[.,;:!?"'()–—])/);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (trimmed && !trimmed.match(/^\s*$/)) {
      // Skip standalone punctuation for word processing, but keep actual words
      if (trimmed.match(/^[.,;:!?"'()–—]+$/)) {
        continue; // Skip punctuation
      }
      words.push({
        word: trimmed,
        strong: null,
        annotated: false
      });
    }
  }

  return words;
}

/**
 * Get English gloss for a German word
 * @param {string} word - German word
 * @returns {string} English gloss
 */
function getGloss(word) {
  // Try exact match first
  if (GERMAN_ENGLISH_DICT[word]) {
    return GERMAN_ENGLISH_DICT[word];
  }

  // Try lowercase
  const lower = word.toLowerCase();
  if (GERMAN_ENGLISH_DICT[lower]) {
    return GERMAN_ENGLISH_DICT[lower];
  }

  // Try without common suffixes
  const suffixes = ['e', 'en', 'er', 'es', 'em', 'n', 's', 'te', 'ten', 'ung', 'heit', 'keit', 'lich', 'isch'];
  for (const suffix of suffixes) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      const stem = word.slice(0, -suffix.length);
      if (GERMAN_ENGLISH_DICT[stem]) {
        return GERMAN_ENGLISH_DICT[stem];
      }
    }
  }

  // Default: capitalize the word as placeholder
  return word.toUpperCase();
}

/**
 * Generate interlinear TSV for chapters
 * @param {string} inputFile - Path to USFM file
 * @param {number} startChapter - Starting chapter
 * @param {number} endChapter - Ending chapter
 * @param {string} outputFile - Path to output TSV file
 */
function generateInterlinear(inputFile, startChapter, endChapter, outputFile) {
  console.log(`Processing chapters ${startChapter}-${endChapter}...`);

  // Read USFM file
  const content = fs.readFileSync(inputFile, 'utf-8');

  // Parse verses
  const verses = parseUSFM(content, startChapter, endChapter);
  console.log(`Found ${verses.length} verses`);

  // Generate TSV output
  const lines = [];

  for (const verse of verses) {
    const ref = `${verse.chapter}:${verse.verse}`;
    const words = extractWords(verse.text);

    // Generate word|gloss pairs
    const pairs = words.map(w => {
      const gloss = getGloss(w.word);
      return `${w.word}|${gloss}`;
    });

    // Join with spaces
    const line = `${ref}\t${pairs.join(' ')}`;
    lines.push(line);
  }

  // Write output
  const output = lines.join('\n');
  fs.writeFileSync(outputFile, output, 'utf-8');
  console.log(`Wrote ${lines.length} verses to ${outputFile}`);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log('Usage: node generate-interlinear.js <input.usfm> <start_chapter> <end_chapter> <output.tsv>');
    process.exit(1);
  }

  const [inputFile, startChapter, endChapter, outputFile] = args;
  generateInterlinear(inputFile, parseInt(startChapter), parseInt(endChapter), outputFile);
}

module.exports = { parseUSFM, extractWords, getGloss, generateInterlinear, GERMAN_ENGLISH_DICT };
