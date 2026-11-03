const ROE_COMPOSERS = Object.fromEntries(window.ROE_DATA.composers.map(c => [c.id, c]));
const wiki = id => `https://en.wikipedia.org/wiki/${encodeURIComponent(ROE_COMPOSERS[id].wikipediaSlug.replace(/ /g, '_'))}`;
const event = (year, ref, text) => ({year, kind: 'event', ref, text});
const peer = (year, ref, text) => ({year, kind: 'contemporary', ref, text});
const life = (id, pts, links, extra = {}) => ({
  pts,
  ...(extra.after ? {after: extra.after} : {}),
  links,
  ...(extra.note ? {note: extra.note} : {}),
  sources: [wiki(id)]
});

window.ROE_LIVES = {
  'giovanni-pierluigi-da-palestrina': life('giovanni-pierluigi-da-palestrina', [
    [1540,.12,.18],[1551,.5,.62,'Leads music at St Peter’s in Rome'],[1555,.55,.58,'Leaves the papal choir after a rule change'],[1563,.72,.7,'Church reform shapes sacred music'],[1571,.9,.82,'Returns to St Peter’s as music director'],[1585,1,.9,'His masses and motets are widely prized'],[1594,.2,.78,'Dies during a plague in Rome']
  ], [
    event(1563,'council-of-trent','Church reform shapes his Roman music posts'),
    peer(1571,'tomas-luis-de-victoria','Victoria studies and works in the same Roman tradition'),
    peer(1590,'claudio-monteverdi','Monteverdi’s newer style moves beyond his model')
  ]),
  'tomas-luis-de-victoria': life('tomas-luis-de-victoria', [
    [1563,.12,.2],[1565,.28,.35,'Studies at the Jesuit college in Rome'],[1571,.5,.48,'Ordained and serves as a priest'],[1575,.72,.62,'Publishes his first collection of motets'],[1583,1,.82,'Returns to Spain and serves Empress Maria'],[1603,.58,.75,'Writes music for the empress’s funeral'],[1611,.15,.62,'Dies in Madrid']
  ], [
    event(1565,'council-of-trent','Catholic reform shapes his sacred music world'),
    peer(1571,'giovanni-pierluigi-da-palestrina','Palestrina’s Roman music is a key model'),
    peer(1590,'claudio-monteverdi','Monteverdi’s career marks a new musical generation')
  ]),
  'claudio-monteverdi': life('claudio-monteverdi', [
    [1582,.12,.18],[1590,.42,.45,'Joins the court of Mantua'],[1600,.55,.58,'Defends his bold new musical style'],[1607,1,.82,'L’Orfeo helps shape early opera'],[1610,.78,.78,'Publishes his Vespers in Venice'],[1613,.88,.9,'Becomes music director at St Mark’s'],[1637,.75,.88,'Venice opens public opera theatres'],[1643,.18,.8,'Dies after a long career in Venice']
  ], [
    peer(1590,'giovanni-pierluigi-da-palestrina','His new style answers the older Roman model'),
    event(1607,'shakespeare-active','Opera rises as Shakespeare’s theatre flourishes'),
    event(1625,'thirty-years-war','War unsettles the Italian states around Venice')
  ], {after:[[1900,.35],[1950,.85,'Early operas return to the stage']]}),
  'henry-purcell': life('henry-purcell', [
    [1674,.12,.22],[1677,.35,.38,'Becomes a Chapel Royal chorister'],[1680,.62,.55,'Appointed organist of Westminster Abbey'],[1687,.78,.68,'Writes music for London theatres'],[1689,.9,.8,'Keeps royal music work through regime change'],[1692,1,.86,'The Fairy Queen delights London audiences'],[1695,.18,.82,'Dies at 36; England mourns its leading composer']
  ], [
    event(1668,'great-fire-of-london','London rebuilds while he grows up in Westminster'),
    event(1688,'glorious-revolution','Keeps his royal music post through a new reign'),
    event(1687,'newton-principia','Works in a London alive with new theatre and science')
  ]),
  'antonio-vivaldi': life('antonio-vivaldi', [
    [1693,.12,.2],[1703,.38,.45,'Ordained; begins teaching at the Pietà'],[1711,.72,.76,'The Four Seasons concertos are published'],[1713,.82,.78,'His first opera opens in Vicenza'],[1725,1,.9,'Concertos make him famous across Europe'],[1735,.52,.58,'Staging operas brings money troubles'],[1740,.25,.18,'Travels to Vienna seeking a new patron'],[1741,.12,.12,'Dies in Vienna, far from his fame']
  ], [
    peer(1720,'johann-sebastian-bach','Bach studies and adapts several of his concertos'),
    event(1710,'war-of-spanish-succession','War years overlap his early Venetian career'),
    peer(1720,'georg-philipp-telemann','Both help Italian-style concertos spread across Europe')
  ], {after:[[1926,.35,'Researchers find a large trove of his music'],[1950,.92,'The Four Seasons becomes a concert favorite']]}),
  'georg-philipp-telemann': life('georg-philipp-telemann', [
    [1696,.1,.18],[1701,.38,.42,'Studies at Leipzig University'],[1705,.55,.62,'Leads music at Sorau and Eisenach'],[1712,.78,.78,'Moves to Frankfurt as city music director'],[1721,1,.95,'Takes charge of Hamburg’s five main churches'],[1731,.82,.9,'Publishes music for players across Europe'],[1755,.35,.82,'Keeps composing into old age'],[1767,.12,.76,'Dies in Hamburg at 86']
  ], [
    peer(1714,'johann-sebastian-bach','Friend of Bach and godfather to his son Carl Philipp'),
    peer(1720,'george-frideric-handel','Close friend and correspondent with Handel'),
    event(1718,'war-of-spanish-succession','His Hamburg career grows during Europe’s war years')
  ]),
  'jean-philippe-rameau': life('jean-philippe-rameau', [
    [1698,.08,.15],[1706,.3,.28,'Works as an organist in several French cities'],[1722,.5,.4,'Publishes his influential Treatise on Harmony'],[1733,.78,.76,'Hippolyte et Aricie stirs Paris opera'],[1745,1,.9,'Wins royal favor for his stage works'],[1753,.72,.7,'Paris debates French and Italian opera'],[1764,.2,.82,'Dies in Paris, honored by the court']
  ], [
    event(1705,'war-of-spanish-succession','Begins his career during Europe’s war years'),
    peer(1753,'christoph-willibald-gluck','Gluck’s reforms follow the operatic world Rameau shaped'),
    event(1756,'seven-years-war','His late Paris years unfold during another European war')
  ]),
  'johann-sebastian-bach': life('johann-sebastian-bach', [
    [1700,.1,.05],[1703,.2,.12,'Organist at Arnstadt'],[1708,.45,.25,'Weimar: the great organ works'],[1717,.55,.3,'Köthen: Brandenburg Concertos'],[1723,1,.4,'Leipzig: a cantata every week'],[1727,.9,.42,'St Matthew Passion'],[1735,.55,.38],[1745,.4,.3,'Art of Fugue and Musical Offering'],[1749,.45,.25,'Mass in B minor nearly complete'],[1750,.2,.2,'Dies after years of failing eyesight']
  ], [
    peer(1720,'antonio-vivaldi','Studies Vivaldi’s concertos and adapts several'),
    peer(1714,'georg-philipp-telemann','Friendship links the two leading German composers'),
    peer(1829,'felix-mendelssohn','Mendelssohn revives the St Matthew Passion')
  ], {after:[[1760,.08],[1800,.12],[1829,.75,'Mendelssohn revives the St Matthew Passion'],[1900,.95]]}),
  'george-frideric-handel': life('george-frideric-handel', [
    [1700,.12,.22],[1706,.38,.45,'Travels to Italy and writes Italian opera'],[1710,.62,.7,'Moves to London for a royal opera post'],[1712,.75,.78,'Makes London his home'],[1720,1,.95,'Leads the Royal Academy of Music'],[1737,.55,.82,'A stroke forces him to rest'],[1741,.78,.9,'Writes Messiah in a burst of work'],[1749,.9,.95,'Music for the Royal Fireworks draws a crowd'],[1759,.15,.92,'Dies after decades as a London star']
  ], [
    event(1710,'war-of-spanish-succession','Builds a London career during Europe’s war years'),
    peer(1719,'georg-philipp-telemann','Friendship and letters connect the two composers'),
    event(1753,'seven-years-war','His later London years unfold during another European war')
  ]),
  'domenico-scarlatti': life('domenico-scarlatti', [
    [1700,.12,.2],[1705,.42,.45,'Works for the Naples royal chapel'],[1709,.55,.56,'Meets Handel in a Rome keyboard contest'],[1719,.7,.68,'Moves to Lisbon to teach the royal family'],[1729,.78,.66,'Follows his pupil Maria Barbara to Spain'],[1738,1,.78,'Publishes his first 30 keyboard sonatas'],[1757,.15,.62,'Dies in Madrid']
  ], [
    peer(1709,'george-frideric-handel','Meets Handel in Rome for a keyboard contest'),
    peer(1738,'johann-sebastian-bach','His keyboard sonatas share Bach’s era of invention'),
    event(1710,'war-of-spanish-succession','His royal posts move as Europe’s war reshapes courts')
  ]),
  'christoph-willibald-gluck': life('christoph-willibald-gluck', [
    [1729,.12,.18],[1737,.35,.38,'Works in Milan and other Italian cities'],[1741,.48,.5,'Wins success with his first opera'],[1750,.6,.58,'Marries and settles in Vienna'],[1762,1,.84,'Orfeo ed Euridice reforms opera'],[1774,.85,.92,'Wins acclaim in Paris'],[1779,.45,.68,'Returns to Vienna after a Paris failure'],[1787,.12,.82,'Dies honored at the Viennese court']
  ], [
    peer(1770,'joseph-haydn','Haydn conducts Gluck’s operas at Eszterháza'),
    peer(1780,'wolfgang-amadeus-mozart','Mozart follows and reworks Gluck’s operatic innovations'),
    event(1787,'french-revolution','Paris opera debates foreshadow political change')
  ]),
  'joseph-haydn': life('joseph-haydn', [
    [1747,.1,.15],[1750,.25,.22,'Leaves the cathedral choir in Vienna'],[1761,.5,.48,'Joins the Esterházy court orchestra'],[1766,.72,.68,'Leads the Esterházy musicians'],[1772,.82,.82,'Writes the dramatic Farewell Symphony'],[1790,.9,.93,'A new patron lets him travel to London'],[1798,1,.96,'The Creation brings fresh acclaim'],[1801,.62,.9,'Completes the oratorio The Seasons'],[1809,.1,.8,'Dies as Napoleon’s army enters Vienna']
  ], [
    peer(1785,'wolfgang-amadeus-mozart','Mozart dedicates six string quartets to Haydn'),
    peer(1792,'ludwig-van-beethoven','Beethoven studies composition with Haydn in Vienna'),
    event(1805,'napoleonic-wars','Napoleon’s wars reach Vienna in Haydn’s final years')
  ]),
  'wolfgang-amadeus-mozart': life('wolfgang-amadeus-mozart', [
    [1771,.12,.3],[1773,.3,.48,'Writes early symphonies in Salzburg'],[1777,.42,.4,'Searches Europe for a better job'],[1781,.62,.55,'Leaves Salzburg for Vienna'],[1786,1,.9,'The Marriage of Figaro wins Vienna'],[1788,.9,.62,'Writes three final symphonies'],[1791,.9,.76,'The Magic Flute opens; Requiem unfinished']
  ], [
    peer(1785,'joseph-haydn','Haydn praises Mozart’s quartets and becomes his friend'),
    peer(1780,'christoph-willibald-gluck','Mozart follows Gluck’s operatic innovations'),
    event(1789,'french-revolution','European political change surrounds his final Vienna years')
  ]),
  'ludwig-van-beethoven': life('ludwig-van-beethoven', [
    [1785,.12,.1],[1792,.35,.3,'Arrives in Vienna and studies with Haydn'],[1795,.55,.55,'Op. 1 trios make him a pianist to watch'],[1802,.45,.5,'Writes of his fear as hearing fades'],[1804,.95,.75,'Eroica breaks new ground'],[1808,1,.85,'Fifth and Sixth symphonies premiere'],[1812,.75,.95,'A star at the Congress of Vienna'],[1819,.5,.58,'Returns to composing after a quiet period'],[1824,.85,.92,'Ninth Symphony premieres to huge applause'],[1827,.15,.78,'Dies after years of deafness']
  ], [
    peer(1792,'joseph-haydn','Haydn teaches him composition in Vienna'),
    event(1804,'napoleonic-wars','Strikes Napoleon’s name from the Eroica dedication'),
    peer(1827,'franz-schubert','Schubert attends his funeral in Vienna')
  ]),
  'niccolo-paganini': life('niccolo-paganini', [
    [1797,.12,.2],[1805,.48,.55,'Becomes first violin to Elisa Bonaparte'],[1809,.58,.6,'Returns to touring across Italy'],[1813,.82,.82,'Milan audiences marvel at his playing'],[1828,1,.98,'Tours Europe and becomes a sensation'],[1834,.35,.68,'Stops touring as his health worsens'],[1840,.12,.5,'Dies in Nice']
  ], [
    peer(1832,'franz-liszt','Hearing Paganini inspires Liszt’s piano virtuosity'),
    peer(1838,'hector-berlioz','Commission leads him to Berlioz’s Harold in Italy'),
    event(1805,'napoleonic-wars','Serves Napoleon’s sister Elisa in Lucca')
  ]),
  'carl-maria-von-weber': life('carl-maria-von-weber', [
    [1801,.1,.14],[1804,.3,.25,'Studies with the composer Michael Haydn'],[1810,.5,.38,'Leads opera companies in German cities'],[1813,.65,.52,'Conducts opera in Prague'],[1817,.82,.68,'Becomes music director in Dresden'],[1821,1,.9,'Der Freischütz makes German opera famous'],[1826,.12,.72,'Dies in London after conducting Oberon']
  ], [
    event(1805,'napoleonic-wars','His early career unfolds as armies cross German lands'),
    peer(1823,'richard-wagner','Weber’s German operas inspire the young Wagner'),
    peer(1821,'ludwig-van-beethoven','Their operas show Vienna two different musical paths')
  ]),
  'franz-schubert': life('franz-schubert', [
    [1812,.12,.02],[1814,.55,.06,'Writes Gretchen at the Spinning Wheel'],[1815,1,.08,'Creates songs at a remarkable pace'],[1818,.58,.1,'Travels to teach music in Hungary'],[1822,.75,.15,'Begins the Unfinished Symphony'],[1825,.65,.18,'Friends gather for Schubertiad evenings'],[1828,.92,.28,'Gives his only public concert, then dies']
  ], [
    peer(1827,'ludwig-van-beethoven','Schubert attends Beethoven’s funeral'),
    peer(1839,'robert-schumann','Schumann finds and champions the Great C major'),
    peer(1839,'felix-mendelssohn','Mendelssohn conducts the newly found C major symphony')
  ], {after:[[1839,.42,'Schumann brings the Great C major to light'],[1900,.85]],note:'Many works premiered after his death'}),
  'hector-berlioz': life('hector-berlioz', [
    [1818,.08,.1],[1826,.25,.18,'Leaves medical school to study music'],[1830,.62,.48,'Wins the Prix de Rome'],[1833,.75,.6,'Marries actress Harriet Smithson'],[1834,.72,.55,'Writes Harold in Italy for Paganini'],[1846,.55,.58,'The Damnation of Faust fails in Paris'],[1854,.78,.66,'Completes the opera Les Troyens'],[1862,.85,.72,'Conducts his opera in Baden-Baden'],[1869,.12,.52,'Dies after years of illness and grief']
  ], [
    peer(1834,'niccolo-paganini','Paganini commissions Harold in Italy'),
    peer(1830,'franz-liszt','Liszt supports his music and arranges it for piano'),
    event(1848,'revolutions-of-1848','Paris upheaval disrupts his concert life')
  ]),
  'felix-mendelssohn': life('felix-mendelssohn', [
    [1824,.12,.25],[1829,.55,.55,'Conducts Bach’s St Matthew Passion revival'],[1833,.68,.7,'Leads music in Düsseldorf'],[1835,.78,.82,'Becomes conductor of Leipzig’s Gewandhaus'],[1837,.85,.84,'Marries Cécile Jeanrenaud'],[1843,1,.94,'Founds Leipzig Conservatory'],[1846,.88,.96,'Elijah succeeds at its premiere'],[1847,.15,.9,'Sister Fanny dies; Felix follows months later']
  ], [
    peer(1839,'robert-schumann','Schumann and Mendelssohn share Leipzig’s music life'),
    peer(1839,'frederic-chopin','Meets Chopin among the leading piano composers'),
    peer(1840,'franz-liszt','Their musical ideas clash in the Romantic debate')
  ], {after:[[1900,.62],[2000,.92]]}),
  'frederic-chopin': life('frederic-chopin', [
    [1825,.12,.2],[1830,.45,.48,'Wins praise in Warsaw as a young pianist'],[1831,.6,.55,'Settles in Paris after a failed uprising'],[1838,.82,.72,'Spends a winter in Majorca with George Sand'],[1841,.92,.84,'Gives celebrated Paris recitals'],[1847,.48,.68,'His partnership with Sand ends'],[1849,.12,.62,'Dies in Paris from lung disease']
  ], [
    peer(1833,'franz-liszt','Liszt and Chopin become friends in Paris'),
    peer(1838,'robert-schumann','Schumann champions his piano music'),
    event(1848,'revolutions-of-1848','Paris upheaval interrupts his final years')
  ]),
  'robert-schumann': life('robert-schumann', [
    [1825,.1,.12],[1830,.32,.2,'Gives up law to study piano and music'],[1834,.72,.42,'Starts the New Journal of Music'],[1840,1,.72,'Marries Clara Wieck after a court case'],[1843,.72,.68,'Teaches at Mendelssohn’s Leipzig Conservatory'],[1844,.45,.58,'Illness forces a move from Leipzig'],[1854,.12,.42,'Enters a hospital after a mental crisis'],[1856,.08,.35,'Dies near Bonn']
  ], [
    peer(1853,'johannes-brahms','Discovers Brahms and welcomes him as a new voice'),
    peer(1839,'felix-mendelssohn','Friend and fellow leader of Leipzig music'),
    peer(1838,'frederic-chopin','Schumann writes warmly about Chopin’s music')
  ]),
  'franz-liszt': life('franz-liszt', [
    [1826,.12,.3],[1832,.55,.72,'Hears Paganini and reshapes piano technique'],[1839,.86,.9,'Tours Europe during “Lisztomania”'],[1848,.9,.84,'Settles in Weimar to compose and conduct'],[1859,.75,.72,'Begins a quieter life after family losses'],[1865,.55,.68,'Takes minor orders in the Catholic Church'],[1881,.42,.62,'Injures himself in a fall'],[1886,.12,.78,'Dies in Bayreuth at 74']
  ], [
    peer(1832,'niccolo-paganini','Paganini’s playing inspires his piano style'),
    peer(1853,'richard-wagner','Supports Wagner and later becomes his father-in-law'),
    event(1848,'revolutions-of-1848','Moves to Weimar as revolutions sweep Europe')
  ]),
  'richard-wagner': life('richard-wagner', [
    [1828,.1,.05],[1833,.28,.18,'Works as a chorus master in Würzburg'],[1842,.55,.55,'Rienzi succeeds in Dresden'],[1849,.25,.2,'Flees after the Dresden uprising'],[1857,.62,.34,'Begins Tristan und Isolde in exile'],[1864,.68,.62,'King Ludwig II pays his debts'],[1876,.95,1,'First Bayreuth Festival stages the Ring'],[1882,.62,.95,'Parsifal opens at Bayreuth'],[1883,.12,.9,'Dies in Venice']
  ], [
    peer(1853,'franz-liszt','Liszt supports him and later becomes his father-in-law'),
    event(1849,'revolutions-of-1848','Revolution forces him into exile for years'),
    event(1871,'german-unification','His new theatre opens in a newly unified Germany')
  ]),
  'giuseppe-verdi': life('giuseppe-verdi', [
    [1828,.08,.12],[1836,.22,.14,'Studies at the Milan Conservatory; rejected'],[1842,.65,.58,'Nabucco makes him famous'],[1851,.88,.82,'Rigoletto succeeds in Venice'],[1853,1,.92,'Il trovatore and La traviata premiere'],[1862,.65,.86,'Brings music to Russia and France'],[1874,.85,.95,'Requiem honors the poet Manzoni'],[1887,.68,.97,'Otello returns him to opera'],[1901,.1,.96,'Milan mourns his death']
  ], [
    event(1861,'italian-unification','His operas become symbols of Italian nationhood'),
    peer(1893,'giacomo-puccini','Puccini’s generation follows his operatic model'),
    peer(1880,'richard-wagner','Their different operas define rival paths')
  ]),
  'cesar-franck': life('cesar-franck', [
    [1837,.12,.18],[1843,.42,.32,'Studies piano and organ in Paris'],[1853,.48,.3,'Leaves a touring career to settle in Paris'],[1859,.62,.38,'Becomes organist at Sainte-Clotilde'],[1872,.72,.52,'Teaches at the Paris Conservatoire'],[1882,.82,.64,'Composes major works late in life'],[1886,1,.76,'Violin Sonata wins wide praise'],[1890,.18,.68,'Dies after a traffic accident']
  ], [
    peer(1886,'camille-saint-saens','Both shape the new French music society'),
    peer(1887,'claude-debussy','Debussy studies in the Paris world Franck leads'),
    event(1871,'franco-prussian-war','War and its aftermath reshape French musical life')
  ]),
  'bedrich-smetana': life('bedrich-smetana', [
    [1839,.1,.12],[1848,.28,.2,'Joins the Prague uprising'],[1856,.38,.25,'Moves to Sweden to teach and conduct'],[1866,.7,.52,'The Bartered Bride wins in Prague'],[1874,.62,.55,'Loses his hearing but keeps composing'],[1876,.95,.72,'Writes the symphonic cycle My Fatherland'],[1884,.12,.72,'Dies after years of illness']
  ], [
    event(1848,'revolutions-of-1848','Takes part in the Prague uprising'),
    peer(1870,'antonin-dvorak','Encourages Dvořák’s career in Prague'),
    peer(1856,'franz-liszt','Liszt supports his early musical ambitions')
  ]),
  'johannes-brahms': life('johannes-brahms', [
    [1848,.12,.1],[1853,.42,.4,'Meets Schumann, who praises his music'],[1859,.55,.52,'First Piano Concerto receives a cool response'],[1868,.82,.78,'A German Requiem brings lasting fame'],[1876,1,.94,'First Symphony finally premieres'],[1883,.9,.98,'Third Symphony wins wide praise'],[1890,.42,.88,'Plans to stop composing, then continues'],[1897,.12,.9,'Dies in Vienna after a long illness']
  ], [
    peer(1853,'robert-schumann','Schumann introduces him to the music world'),
    peer(1853,'franz-liszt','Meets Liszt as Romantic composers debate new music'),
    peer(1878,'antonin-dvorak','Encourages Dvořák and helps him find a publisher')
  ]),
  'alexander-borodin': life('alexander-borodin', [
    [1848,.08,.1],[1856,.18,.12,'Begins medical and chemistry studies'],[1862,.35,.2,'Meets the composers of “The Five”'],[1869,.48,.32,'Starts work on the opera Prince Igor'],[1877,.7,.45,'Teaches chemistry and composes when able'],[1880,1,.52,'In the Steppes of Central Asia is a hit'],[1887,.1,.42,'Dies suddenly at a ball']
  ], [
    peer(1856,'modest-mussorgsky','Friendship grows among members of “The Five”'),
    peer(1870,'nikolai-rimsky-korsakov','Works with Rimsky-Korsakov on Russian music'),
    event(1877,'first-phonograph','New recording technology begins to preserve music')
  ]),
  'camille-saint-saens': life('camille-saint-saens', [
    [1850,.12,.2],[1853,.48,.52,'Graduates from the Paris Conservatoire'],[1858,.68,.65,'Becomes organist at La Madeleine'],[1868,.82,.72,'Tours as a pianist and composer'],[1877,.88,.82,'Samson and Delilah reaches the stage'],[1886,1,.9,'The Organ Symphony and Carnival appear'],[1890,.78,.94,'Tours widely in Europe and America'],[1921,.12,.82,'Dies in Algiers at 86']
  ], [
    peer(1886,'cesar-franck','Both lead a new generation of French composers'),
    peer(1894,'claude-debussy','His traditional style clashes with Debussy’s innovations'),
    event(1877,'first-phonograph','Recording technology begins during his career')
  ]),
  'modest-mussorgsky': life('modest-mussorgsky', [
    [1854,.1,.1],[1858,.25,.16,'Leaves military service to study music'],[1863,.42,.22,'Works with fellow Russian composers'],[1871,.65,.35,'Boris Godunov opens in Saint Petersburg'],[1874,1,.48,'Pictures at an Exhibition is written'],[1877,.45,.38,'Health and money problems grow'],[1881,.1,.25,'Dies in a military hospital']
  ], [
    peer(1856,'alexander-borodin','Becomes close friends with Borodin'),
    peer(1870,'nikolai-rimsky-korsakov','Rimsky-Korsakov later edits and performs his music'),
    event(1871,'german-unification','Russian composers debate national musical identity')
  ], {after:[[1890,.45],[1920,.9]]}),
  'pyotr-ilyich-tchaikovsky': life('pyotr-ilyich-tchaikovsky', [
    [1855,.12,.05],[1862,.25,.12,'Enters the new Saint Petersburg Conservatory'],[1866,.42,.25,'Begins teaching in Moscow'],[1875,.72,.5,'Piano Concerto No. 1 takes shape'],[1877,.5,.42,'Marriage crisis; patron Nadezhda von Meck helps'],[1878,.95,.58,'Writes the Violin Concerto and Fourth Symphony'],[1890,.88,.85,'The Queen of Spades premieres'],[1891,.62,.94,'Conducts at Carnegie Hall’s opening'],[1893,.18,.82,'Pathétique premieres; he dies days later']
  ], [
    peer(1887,'nikolai-rimsky-korsakov','Friendship links two leading Russian composers'),
    peer(1876,'camille-saint-saens','Meets Saint-Saëns during a visit to Russia'),
    event(1877,'first-phonograph','Recording technology begins during his career')
  ]),
  'antonin-dvorak': life('antonin-dvorak', [
    [1856,.12,.1],[1862,.32,.2,'Plays viola in Prague theatre orchestras'],[1873,.48,.34,'Wins fame with his Czech hymns'],[1878,.72,.55,'Slavonic Dances become popular'],[1884,.9,.76,'Tours England with his music'],[1892,.88,.9,'Moves to New York to lead a music school'],[1893,1,.92,'Writes the New World Symphony'],[1901,.6,.94,'Returns to Prague as a respected elder'],[1904,.12,.86,'Dies in Prague']
  ], [
    peer(1878,'johannes-brahms','Brahms helps his music reach a major publisher'),
    peer(1870,'bedrich-smetana','Smetana supports his early career in Prague'),
    peer(1892,'pyotr-ilyich-tchaikovsky','The composers meet during Dvořák’s American years')
  ]),
  'edvard-grieg': life('edvard-grieg', [
    [1858,.12,.12],[1862,.3,.25,'Studies at the Leipzig Conservatory'],[1867,.55,.45,'Founds a music academy in Oslo'],[1874,.72,.62,'Ibsen asks him to write Peer Gynt music'],[1884,.86,.78,'Builds a home near Bergen'],[1893,1,.9,'Oxford awards him an honorary degree'],[1907,.12,.88,'Dies after years of heart trouble']
  ], [
    peer(1870,'franz-liszt','Liszt praises Grieg’s Piano Concerto'),
    peer(1880,'antonin-dvorak','Shares a European stage with another national composer'),
    event(1877,'first-phonograph','Recording technology emerges during his composing career')
  ]),
  'nikolai-rimsky-korsakov': life('nikolai-rimsky-korsakov', [
    [1859,.12,.12],[1862,.25,.18,'Joins the Russian navy as a cadet'],[1865,.52,.35,'Writes his First Symphony at sea'],[1871,.72,.52,'Becomes a professor in Saint Petersburg'],[1873,.78,.6,'Leaves the navy to focus on music'],[1888,1,.82,'Scheherazade wins acclaim'],[1905,.62,.72,'Supports student protests at the conservatory'],[1908,.12,.68,'Dies after a heart condition']
  ], [
    peer(1870,'modest-mussorgsky','Friend and fellow member of “The Five”'),
    peer(1870,'alexander-borodin','Works beside Borodin in Russian musical circles'),
    peer(1900,'igor-stravinsky','Teaches and mentors the young Stravinsky')
  ]),
  'edward-elgar': life('edward-elgar', [
    [1872,.1,.08],[1877,.2,.12,'Learns music while helping in his father’s shop'],[1884,.32,.22,'Works as a violinist and music teacher'],[1899,.72,.58,'Enigma Variations brings national fame'],[1901,.92,.8,'Pomp and Circumstance March No. 1 is a hit'],[1914,.9,.88,'Writes music as war begins'],[1920,.38,.76,'His wife Alice dies'],[1934,.12,.7,'Dies in Worcester']
  ], [
    peer(1904,'gustav-mahler','Mahler conducts Elgar’s Enigma Variations'),
    peer(1902,'richard-strauss','Strauss praises and meets the English composer'),
    event(1914,'world-war-1','War changes the country and the music he writes')
  ]),
  'giacomo-puccini': life('giacomo-puccini', [
    [1873,.1,.12],[1880,.22,.15,'Studies music in Lucca and Milan'],[1884,.42,.28,'His first opera opens in Milan'],[1893,.75,.62,'Manon Lescaut brings success'],[1896,1,.84,'La bohème premieres in Turin'],[1904,.78,.86,'Madama Butterfly is revised after a poor opening'],[1910,.7,.9,'The Girl of the Golden West opens in New York'],[1924,.12,.86,'Dies before finishing Turandot']
  ], [
    peer(1893,'giuseppe-verdi','Puccini carries Italian opera into a new generation'),
    peer(1906,'gustav-mahler','Mahler’s Vienna Opera helps spread Puccini’s operas'),
    event(1914,'world-war-1','War interrupts European opera and his later career')
  ]),
  'gustav-mahler': life('gustav-mahler', [
    [1875,.12,.1],[1880,.28,.2,'Graduates from the Vienna Conservatory'],[1883,.5,.35,'Conducts in Kassel and writes songs'],[1888,.72,.55,'Completes his First Symphony'],[1897,.82,.78,'Becomes director of the Vienna Opera'],[1901,.95,.88,'Marries Alma Schindler'],[1907,.72,.82,'Daughter dies; doctors find heart disease'],[1908,1,.72,'The Eighth Symphony premieres'],[1911,.12,.68,'Dies in Vienna']
  ], [
    peer(1907,'jean-sibelius','Meets Sibelius and debates what a symphony should be'),
    peer(1904,'richard-strauss','Fellow conductors and leading opera composers'),
    peer(1904,'arnold-schoenberg','Supports Schoenberg and his new music')
  ], {after:[[1960,.42],[1980,.86,'Bernstein and others renew interest in his symphonies']]}),
  'claude-debussy': life('claude-debussy', [
    [1877,.1,.08],[1880,.22,.12,'Studies at the Paris Conservatoire'],[1884,.48,.3,'Wins the Prix de Rome'],[1894,.72,.48,'Prelude to the Afternoon of a Faun premieres'],[1902,1,.82,'Pelléas and Mélisande opens in Paris'],[1905,.92,.84,'La mer reaches the concert hall'],[1914,.52,.78,'Cancer and war slow his work'],[1918,.12,.68,'Dies during the First World War']
  ], [
    peer(1896,'erik-satie','Debussy orchestrates two of Satie’s piano pieces'),
    peer(1905,'maurice-ravel','They share audiences but resist the “Impressionist” label'),
    event(1914,'world-war-1','War interrupts his final years and planned works')
  ]),
  'richard-strauss': life('richard-strauss', [
    [1879,.1,.12],[1883,.3,.28,'Assists conductor Hans von Bülow'],[1889,.62,.58,'Don Juan makes his name as a composer'],[1905,1,.92,'Salome shocks audiences and wins fame'],[1911,.92,.95,'Der Rosenkavalier succeeds in Dresden'],[1933,.58,.78,'Heads Germany’s state music office under Hitler'],[1945,.35,.62,'Writes Metamorphosen as war ends'],[1949,.12,.58,'Dies in Bavaria at 85']
  ], [
    peer(1904,'gustav-mahler','Colleagues and rivals in the opera and concert world'),
    peer(1904,'claude-debussy','Their new operas reshape European music'),
    event(1933,'rise-of-nazism','Takes a music leadership post under the Nazi regime')
  ]),
  'jean-sibelius': life('jean-sibelius', [
    [1880,.1,.08],[1885,.3,.18,'Studies music in Helsinki and Berlin'],[1892,.62,.42,'Kullervo makes him a Finnish national figure'],[1899,.85,.72,'Finlandia rallies audiences'],[1904,.92,.82,'Moves to a home outside Helsinki'],[1915,1,.9,'Fiftieth birthday brings public celebration'],[1926,.62,.82,'Completes his last major orchestral work'],[1935,.32,.78,'Stops composing new symphonies'],[1957,.08,.74,'Dies after decades of silence']
  ], [
    peer(1907,'gustav-mahler','Meets Mahler during a visit to Helsinki'),
    peer(1900,'edvard-grieg','Their music helps define northern European identity'),
    event(1917,'russian-revolution','Finnish independence follows Russia’s revolution')
  ]),
  'erik-satie': life('erik-satie', [
    [1881,.12,.08],[1885,.2,.1,'Leaves the Paris Conservatoire without a diploma'],[1887,.42,.16,'Writes the first Gymnopédies'],[1891,.5,.25,'Composes for the Rosicrucian movement'],[1905,.28,.12,'Returns to school at the Schola Cantorum'],[1911,.58,.35,'Young composers discover his music'],[1917,1,.72,'Ballet Parade brings him public attention'],[1925,.12,.58,'Dies in Paris after years of illness']
  ], [
    peer(1896,'claude-debussy','Debussy orchestrates Satie’s Gymnopédies'),
    peer(1911,'maurice-ravel','Ravel helps bring Satie’s early music back to life'),
    peer(1917,'igor-stravinsky','Stravinsky’s circle meets Satie through the ballet Parade')
  ], {after:[[1960,.7,'New listeners revive his simple piano pieces'],[1980,.95]]}),
  'sergei-rachmaninoff': life('sergei-rachmaninoff', [
    [1888,.12,.12],[1892,.38,.3,'Graduates from the Moscow Conservatory'],[1897,.16,.12,'First Symphony fails; he stops composing'],[1901,.68,.62,'Second Piano Concerto brings success'],[1909,1,.9,'Tours America with his Third Concerto'],[1917,.5,.72,'Leaves Russia after the revolution'],[1926,.74,.84,'Returns to composing after a long pause'],[1934,.9,.9,'Rhapsody on a Theme of Paganini premieres'],[1943,.12,.82,'Dies in California']
  ], [
    peer(1892,'pyotr-ilyich-tchaikovsky','Tchaikovsky praises his early music before his death'),
    peer(1939,'igor-stravinsky','The Russian exiles meet in the United States'),
    event(1917,'russian-revolution','Revolution forces him to leave Russia')
  ]),
  'arnold-schoenberg': life('arnold-schoenberg', [
    [1889,.1,.08],[1894,.25,.14,'Studies counterpoint with Alexander von Zemlinsky'],[1899,.52,.3,'Writes the string sextet Verklärte Nacht'],[1908,.68,.42,'Moves away from traditional tonality'],[1912,.78,.48,'Pierrot Lunaire startles Berlin audiences'],[1923,.62,.44,'Develops a twelve-tone method'],[1933,.35,.32,'Flees Germany after the Nazis take power'],[1945,.72,.58,'Teaches in California after the war'],[1951,.12,.55,'Dies in Los Angeles']
  ], [
    peer(1904,'gustav-mahler','Mahler supports his music when audiences protest'),
    peer(1920,'igor-stravinsky','Their contrasting styles fuel debate about modern music'),
    event(1933,'rise-of-nazism','Leaves Germany as Nazi rule begins')
  ]),
  'maurice-ravel': life('maurice-ravel', [
    [1890,.1,.1],[1898,.3,.22,'Studies at the Paris Conservatoire'],[1905,.45,.28,'A Conservatoire scandal ends his student years'],[1909,.66,.58,'Daphnis and Chloé is commissioned by Diaghilev'],[1912,.82,.75,'The ballet premieres in Paris'],[1917,.52,.64,'Serves as a lorry driver during the war'],[1928,1,.98,'Boléro becomes an international hit'],[1932,.62,.86,'A taxi accident harms his health'],[1937,.12,.78,'Dies after brain surgery']
  ], [
    peer(1905,'claude-debussy','Shares Paris audiences with his older contemporary'),
    peer(1911,'erik-satie','Helps draw attention to Satie’s early piano music'),
    event(1914,'world-war-1','Serves in the army and loses friends in the war')
  ]),
  'bela-bartok': life('bela-bartok', [
    [1896,.12,.1],[1903,.38,.28,'Wins notice as a pianist and composer'],[1908,.65,.45,'Collects folk songs with Zoltán Kodály'],[1911,.58,.4,'His opera Bluebeard’s Castle is rejected'],[1923,.82,.7,'Dance Suite brings orchestral success'],[1934,1,.88,'Leaves teaching to study folk music full-time'],[1940,.38,.6,'Moves to the United States to escape war'],[1943,.68,.58,'Writes his Concerto for Orchestra'],[1945,.12,.42,'Dies in New York']
  ], [
    peer(1910,'igor-stravinsky','Both renew concert music with folk rhythms'),
    peer(1910,'claude-debussy','Studies Debussy’s music as a young modernist'),
    event(1940,'world-war-2','Leaves Europe as war spreads')
  ]),
  'igor-stravinsky': life('igor-stravinsky', [
    [1897,.12,.08],[1906,.3,.22,'Studies with Rimsky-Korsakov'],[1910,.68,.62,'The Firebird makes him famous'],[1913,.9,.95,'The Rite of Spring sparks a riot'],[1918,.52,.62,'Writes The Soldier’s Tale in wartime Switzerland'],[1923,.68,.78,'Turns toward neoclassical music in Paris'],[1939,.35,.62,'Moves to the United States'],[1951,.72,.8,'The Rake’s Progress premieres'],[1957,.66,.84,'Begins using serial techniques'],[1966,.32,.88,'Continues composing into old age'],[1971,.12,.84,'Dies in New York']
  ], [
    peer(1906,'nikolai-rimsky-korsakov','Rimsky-Korsakov teaches and mentors him'),
    peer(1913,'claude-debussy','Debussy attends the Rite of Spring premiere'),
    peer(1920,'arnold-schoenberg','Their contrasting approaches shape modern music')
  ]),
  'sergei-prokofiev': life('sergei-prokofiev', [
    [1906,.12,.1],[1909,.38,.32,'Enters the Saint Petersburg Conservatory'],[1914,.55,.58,'Wins a piano contest with his own concerto'],[1918,.48,.55,'Leaves Russia after the revolution'],[1921,.72,.75,'The opera Love for Three Oranges premieres'],[1936,.78,.72,'Returns to live in the Soviet Union'],[1940,1,.84,'Romeo and Juliet reaches the stage'],[1948,.38,.3,'Soviet officials condemn his music'],[1953,.12,.24,'Dies on the day Stalin dies']
  ], [
    peer(1914,'igor-stravinsky','Meets Stravinsky and other Russian modernists in Europe'),
    peer(1936,'dmitri-shostakovich','Shares the Soviet music world with Shostakovich'),
    event(1948,'zhdanov-doctrine','Official decree condemns his music')
  ]),
  'paul-hindemith': life('paul-hindemith', [
    [1910,.1,.1],[1914,.22,.14,'Joins the Frankfurt Opera orchestra'],[1921,.55,.42,'Founds the Amar String Quartet'],[1927,.82,.7,'Becomes a music teacher in Berlin'],[1933,.62,.48,'Nazi rule makes his work difficult'],[1938,.78,.62,'Moves to Switzerland'],[1940,.72,.72,'Emigrates to the United States'],[1953,1,.9,'Conducts and teaches in Europe again'],[1963,.12,.82,'Dies in Frankfurt']
  ], [
    peer(1920,'igor-stravinsky','Their modern music explores new musical forms'),
    peer(1920,'bela-bartok','Both write for performers and concert halls across Europe'),
    event(1938,'rise-of-nazism','Leaves Germany as the Nazi regime tightens control')
  ]),
  'aaron-copland': life('aaron-copland', [
    [1915,.12,.1],[1921,.32,.25,'Studies in Paris with Nadia Boulanger'],[1925,.5,.4,'First major orchestral works reach New York'],[1929,.6,.42,'Composes music in a modernist style'],[1936,.68,.58,'Turns toward a more accessible American sound'],[1944,1,.88,'Appalachian Spring premieres in Washington'],[1950,.78,.86,'Teaches and conducts across the country'],[1972,.48,.86,'Stops composing after memory problems'],[1990,.12,.82,'Dies in New York']
  ], [
    peer(1939,'igor-stravinsky','Stravinsky’s music shapes Copland’s early modernism'),
    peer(1945,'benjamin-britten','Friendship links two influential 20th-century composers'),
    event(1947,'cold-war-begins','Cold War politics affect his public life and work')
  ]),
  'dmitri-shostakovich': life('dmitri-shostakovich', [
    [1921,.12,.08],[1926,.58,.65,'First Symphony brings fame at nineteen'],[1934,.82,.85,'Lady Macbeth is a success in Leningrad'],[1936,.28,.15,'Newspaper attack condemns his opera'],[1937,.72,.68,'Fifth Symphony wins back public favor'],[1942,.88,.94,'Leningrad Symphony is heard around the world'],[1948,.3,.2,'Official decree condemns his music'],[1953,.78,.7,'Writes the Tenth Symphony after Stalin dies'],[1962,.62,.82,'Babi Yar Symphony faces official pressure'],[1971,.55,.86,'Completes his Fifteenth Symphony'],[1975,.12,.84,'Dies after years of illness']
  ], [
    event(1942,'world-war-2','His Leningrad Symphony becomes a wartime signal'),
    event(1948,'zhdanov-doctrine','The state condemns him again'),
    peer(1960,'benjamin-britten','The two composers become friends and visit each other')
  ]),
  'benjamin-britten': life('benjamin-britten', [
    [1928,.12,.12],[1934,.28,.24,'Studies at the Royal College of Music'],[1937,.52,.42,'Variations on a Theme of Frank Bridge succeeds'],[1942,.5,.44,'Returns to England during the war'],[1945,.88,.8,'Peter Grimes makes him famous'],[1951,.78,.84,'Billy Budd opens at Covent Garden'],[1962,1,.96,'War Requiem premieres in Coventry'],[1973,.48,.82,'Illness forces him to reduce his work'],[1976,.12,.78,'Dies in Aldeburgh']
  ], [
    event(1939,'world-war-2','War shapes his move back to England'),
    peer(1960,'dmitri-shostakovich','The composers become friends and visit each other'),
    peer(1945,'aaron-copland','Copland and Britten share music and a friendship')
  ])
};
