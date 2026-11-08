const instrumentExtra = (title, composerName, composerId, year, why, surname, greats, goat = null) => ({
  showcase: {
    title,
    composerName,
    composerId,
    year,
    why,
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`${title} ${surname}`)}`
  },
  greats,
  goat
});

window.ROE_INSTR_EXTRA = {
  violin: instrumentExtra('The Four Seasons', 'Antonio Vivaldi', 'antonio-vivaldi', 1725, 'Four vivid concertos put the violin at the center of every season.', 'Vivaldi', [
    {name:'Niccolò Paganini',note:'Changed violin technique with dazzling virtuosity.'},
    {name:'Jascha Heifetz',note:'A celebrated 20th-century virtuoso.'},
    {name:'Itzhak Perlman',note:'Beloved for his warm tone and broad career.'}
  ]),
  viola: instrumentExtra('Harold in Italy', 'Hector Berlioz', 'hector-berlioz', 1834, 'A solo viola travels through a colorful orchestral story.', 'Berlioz', [
    {name:'William Primrose',note:'Raised the viola’s profile as a solo instrument.'},
    {name:'Tabea Zimmermann',note:'Known for expressive playing and teaching.'},
    {name:'Yuri Bashmet',note:'A leading viola soloist and ensemble founder.'}
  ]),
  cello: instrumentExtra('Cello Concerto in E minor, Op. 85', 'Edward Elgar', 'edward-elgar', 1919, 'A deeply lyrical concerto that makes the cello sing and surge.', 'Elgar', [
    {name:'Pablo Casals',note:'Helped bring Bach’s cello suites to concert halls.'},
    {name:'Yo-Yo Ma',note:'A wide-ranging performer and musical ambassador.'},
    {name:'Jacqueline du Pré',note:'Her Elgar concerto recording became iconic.'}
  ], {name:'Yo-Yo Ma',note:'A celebrated cellist known for broad-ranging performances.'}),
  'double-bass': instrumentExtra('Concerto No. 2 in B minor', 'Giovanni Bottesini', null, 1845, 'A showpiece that reveals the bass’s agility and singing voice.', 'Bottesini', [
    {name:'Giovanni Bottesini',note:'Known as a leading bass virtuoso of his era.'},
    {name:'Serge Koussevitzky',note:'Bass soloist before becoming a famous conductor.'},
    {name:'Gary Karr',note:'Helped establish the bass as a solo instrument.'}
  ]),
  harp: instrumentExtra('Danse sacrée et danse profane', 'Claude Debussy', 'claude-debussy', 1904, 'The harp glides between shimmering dance rhythms and solemn chords.', 'Debussy', [
    {name:'Lily Laskine',note:'A celebrated French harpist and teacher.'},
    {name:'Marisa Robles',note:'Known for solo work and chamber music.'},
    {name:'Xavier de Maistre',note:'A leading solo harpist of today.'}
  ]),
  'viola-da-gamba': instrumentExtra('Les Folies d’Espagne', 'Marin Marais', null, 1701, 'Famous variations turn a simple theme into a gamba showpiece.', 'Marais', [
    {name:'Marin Marais',note:'A leading French composer and viol player.'},
    {name:'Sainte-Colombe',note:'A French viol master and teacher.'},
    {name:'Jordi Savall',note:'A leading modern performer and scholar.'}
  ]),
  flute: instrumentExtra('Syrinx', 'Claude Debussy', 'claude-debussy', 1913, 'A solo flute paints a quiet myth with no accompaniment.', 'Debussy', [
    {name:'Jean-Pierre Rampal',note:'Popularized the flute as a solo instrument.'},
    {name:'James Galway',note:'Known for a bright tone and wide audience.'},
    {name:'Emmanuel Pahud',note:'A leading orchestral and solo flutist.'}
  ]),
  oboe: instrumentExtra('Oboe Concerto in D major', 'Richard Strauss', 'richard-strauss', 1945, 'A graceful late concerto lets the oboe lead from start to finish.', 'Strauss', [
    {name:'Heinz Holliger',note:'A virtuoso oboist, composer, and conductor.'},
    {name:'Albrecht Mayer',note:'Known for lyrical playing with the Berlin Philharmonic.'},
    {name:'Marcel Tabuteau',note:'Helped shape modern French oboe playing.'}
  ]),
  clarinet: instrumentExtra('Clarinet Concerto in A major, K. 622', 'Wolfgang Amadeus Mozart', 'wolfgang-amadeus-mozart', 1791, 'The clarinet’s warm range shines in Mozart’s final concerto.', 'Mozart', [
    {name:'Benny Goodman',note:'Jazz clarinetist who also championed new concert works.'},
    {name:'Sabine Meyer',note:'A leading soloist and orchestral player.'},
    {name:'Martin Fröst',note:'Known for imaginative performances and programming.'}
  ]),
  bassoon: instrumentExtra('Bassoon Concerto in B-flat major, K. 191', 'Wolfgang Amadeus Mozart', 'wolfgang-amadeus-mozart', 1774, 'A playful concerto shows the bassoon’s nimble, singing character.', 'Mozart', [
    {name:'Klaus Thunemann',note:'A celebrated soloist and teacher.'},
    {name:'Milan Turkovic',note:'Known for solo and chamber performances.'},
    {name:'Sergio Azzolini',note:'A leading performer on modern and Baroque bassoons.'}
  ]),
  recorder: instrumentExtra('Recorder Concerto in C major, TWV 51:C1', 'Georg Philipp Telemann', 'georg-philipp-telemann', 1725, 'Bright recorder lines show why it was prized in Baroque music.', 'Telemann', [
    {name:'Frans Brüggen',note:'Helped revive the recorder in modern concert life.'},
    {name:'Michala Petri',note:'A widely recorded recorder soloist.'},
    {name:'Dorothee Oberlinger',note:'Performs and teaches early music.'}
  ]),
  'french-horn': instrumentExtra('Horn Concerto No. 4 in E-flat major, K. 495', 'Wolfgang Amadeus Mozart', 'wolfgang-amadeus-mozart', 1786, 'Long melodies and lively calls show the horn’s range.', 'Mozart', [
    {name:'Dennis Brain',note:'A landmark horn soloist of the 20th century.'},
    {name:'Hermann Baumann',note:'Known for solo playing and historical performance.'},
    {name:'Dale Clevenger',note:'Led the Chicago Symphony horn section for decades.'}
  ]),
  trumpet: instrumentExtra('Trumpet Concerto in E-flat major', 'Joseph Haydn', 'joseph-haydn', 1796, 'The new keyed trumpet brings a clear, brilliant solo voice.', 'Haydn', [
    {name:'Maurice André',note:'Helped make the trumpet a popular solo instrument.'},
    {name:'Wynton Marsalis',note:'A major classical and jazz trumpet soloist.'},
    {name:'Alison Balsom',note:'A leading modern trumpet soloist.'}
  ]),
  trombone: instrumentExtra('Boléro', 'Maurice Ravel', 'maurice-ravel', 1928, 'A famous rising trombone slide cuts through the repeating dance.', 'Ravel', [
    {name:'Christian Lindberg',note:'A leading trombone soloist and composer.'},
    {name:'Joseph Alessi',note:'Principal trombone of the New York Philharmonic.'},
    {name:'J. J. Johnson',note:'A defining jazz trombonist.'}
  ]),
  tuba: instrumentExtra('Tuba Concerto in F minor', 'Ralph Vaughan Williams', null, 1954, 'A full concerto gives the tuba a rare starring role.', 'Vaughan Williams', [
    {name:'William Bell',note:'Helped establish the tuba in American orchestras.'},
    {name:'Roger Bobo',note:'A pioneer of the tuba solo recital.'},
    {name:'Øystein Baadsvik',note:'Known for virtuosic solo performances.'}
  ]),
  timpani: instrumentExtra('Symphony No. 9 in D minor', 'Ludwig van Beethoven', 'ludwig-van-beethoven', 1824, 'The timpani adds thunder and drive to the symphony’s climaxes.', 'Beethoven', [
    {name:'Saul Goodman',note:'A major teacher who shaped American timpani playing.'},
    {name:'Evelyn Glennie',note:'A celebrated solo percussionist and educator.'},
    {name:'Jonathan Haas',note:'Known for solo timpani performances.'}
  ]),
  'snare-drum': instrumentExtra('Boléro', 'Maurice Ravel', 'maurice-ravel', 1928, 'The snare drum repeats its rhythm as the orchestra steadily grows.', 'Ravel', [
    {name:'Charles Wilcoxon',note:'A major snare-drum teacher and method author.'},
    {name:'John Bonham',note:'A celebrated rock drummer with a powerful sound.'},
    {name:'Evelyn Glennie',note:'A leading solo percussionist.'}
  ]),
  'cymbals-and-percussion': instrumentExtra('The Rite of Spring', 'Igor Stravinsky', 'igor-stravinsky', 1913, 'A vivid mix of drums, cymbals, and other percussion drives the score.', 'Stravinsky', [
    {name:'Evelyn Glennie',note:'A leading soloist across the percussion family.'},
    {name:'John Cage',note:'Expanded percussion instruments in concert music.'},
    {name:'Tito Puente',note:'Master timbalero and Latin-jazz bandleader.'}
  ]),
  piano: instrumentExtra('Piano Sonata No. 14 “Moonlight”', 'Ludwig van Beethoven', 'ludwig-van-beethoven', 1801, 'A quiet opening and stormy finale reveal the piano’s range.', 'Beethoven', [
    {name:'Frédéric Chopin',note:'A defining composer for solo piano.'},
    {name:'Franz Liszt',note:'Transformed piano performance and technique.'},
    {name:'Martha Argerich',note:'Known for energetic, expressive performances.'}
  ]),
  organ: instrumentExtra('Toccata and Fugue in D minor, BWV 565', 'Johann Sebastian Bach', 'johann-sebastian-bach', 1708, 'Bold opening flourishes lead into a tightly woven fugue.', 'Bach', [
    {name:'Johann Sebastian Bach',note:'A central composer and organ virtuoso.'},
    {name:'César Franck',note:'Revived French organ music in the 19th century.'},
    {name:'Olivier Messiaen',note:'A major 20th-century organ composer.'}
  ]),
  harpsichord: instrumentExtra('Goldberg Variations, BWV 988', 'Johann Sebastian Bach', 'johann-sebastian-bach', 1741, 'Thirty variations turn one simple bass line into a world of music.', 'Bach', [
    {name:'Wanda Landowska',note:'Helped restore the harpsichord to concert stages.'},
    {name:'Gustav Leonhardt',note:'A major early-music performer and scholar.'},
    {name:'Trevor Pinnock',note:'A leading harpsichordist and conductor.'}
  ]),
  celesta: instrumentExtra('Dance of the Sugar Plum Fairy', 'Pyotr Ilyich Tchaikovsky', 'pyotr-ilyich-tchaikovsky', 1892, 'Its sparkling celesta gives the dance its magical sound.', 'Tchaikovsky', [
    {name:'Tchaikovsky',note:'Made the celesta famous in The Nutcracker.'},
    {name:'Reinhold Glière',note:'Used the celesta in his Harp Concerto.'},
    {name:'John Williams',note:'Uses celesta color in film and concert scores.'}
  ]),
  soprano: instrumentExtra('“Queen of the Night” aria from The Magic Flute', 'Wolfgang Amadeus Mozart', 'wolfgang-amadeus-mozart', 1791, 'A coloratura aria asks the soprano to leap high and sing quickly.', 'Mozart', [
    {name:'Maria Callas',note:'A celebrated opera singer with dramatic range.'},
    {name:'Joan Sutherland',note:'Famous for brilliant coloratura singing.'},
    {name:'Renée Fleming',note:'A leading lyric soprano on stage and recordings.'}
  ]),
  'alto-mezzo': instrumentExtra('“Habanera” from Carmen', 'Georges Bizet', null, 1875, 'Carmen’s memorable entrance gives the mezzo a bold character role.', 'Bizet', [
    {name:'Marilyn Horne',note:'A major mezzo-soprano and bel canto specialist.'},
    {name:'Cecilia Bartoli',note:'Known for agile singing and rediscovered works.'},
    {name:'Teresa Berganza',note:'A celebrated Carmen and Mozart performer.'}
  ]),
  tenor: instrumentExtra('“Nessun dorma” from Turandot', 'Giacomo Puccini', 'giacomo-puccini', 1926, 'A soaring tenor aria builds toward a famous final high note.', 'Puccini', [
    {name:'Luciano Pavarotti',note:'Brought the tenor voice to huge audiences.'},
    {name:'Enrico Caruso',note:'An early recording star of the operatic tenor voice.'},
    {name:'Jonas Kaufmann',note:'A leading tenor across opera and song.'}
  ]),
  'bass-baritone': instrumentExtra('“Catalogue Aria” from Don Giovanni', 'Wolfgang Amadeus Mozart', 'wolfgang-amadeus-mozart', 1787, 'Leporello’s quick list gives a bass-baritone a comic showcase.', 'Mozart', [
    {name:'Dietrich Fischer-Dieskau',note:'A renowned singer of opera and art song.'},
    {name:'Bryn Terfel',note:'Known for expressive bass-baritone roles.'},
    {name:'Samuel Ramey',note:'A celebrated singer of Mozart and bel canto roles.'}
  ])
};
