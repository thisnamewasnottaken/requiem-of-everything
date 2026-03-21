#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate Afrikaans composers.json translation."""
import json
import os

composers_af = {
    "giovanni-pierluigi-da-palestrina": {
        "name": "Giovanni Pierluigi da Palestrina",
        "shortName": "Palestrina",
        "biography": "Die meester van Renaissance-polifonie. Palestrina se vloeiende, gladde kontrapunt het die model vir gewyde musiekkomposisie vir eeue geword. Sy misse en motette verteenwoordig die hoogtepunt van die Romeinse Skool, en sy styl is later gekodifiseer as die grondslag van kontrapuntstudie.",
        "birthPlace": "Palestrina, Pouslike State",
        "nationality": "Italiaans"
    },
    "tomas-luis-de-victoria": {
        "name": "Tomás Luis de Victoria",
        "shortName": "Victoria",
        "biography": "Die grootste Spaanse komponis van die Renaissance en een van die belangrikste polifoniste van sy era. Victoria het homself uitsluitlik aan gewyde musiek gewy en het misse, motette en die diep uitdrukkingsvolle Officium Defunctorum gekomponeer. Sy intens emosionele styl het hom van sy Romeinse Skool-tydgenote onderskei.",
        "birthPlace": "Ávila, Spanje",
        "nationality": "Spaans"
    },
    "claudio-monteverdi": {
        "name": "Claudio Monteverdi",
        "shortName": "Monteverdi",
        "biography": "'n Revolusionêre figuur wat die Renaissance en Barok oorbrug het. Monteverdi se operas — veral L'Orfeo — het opera as 'n belangrike kunsvorm gevestig. Sy madrigale het die grense van harmonie en teksuitdrukking verskuif en die oorgang van Renaissance-polifonie na Barokdrama gemerk.",
        "birthPlace": "Cremona, Hertogdom Milaan",
        "nationality": "Italiaans"
    },
    "henry-purcell": {
        "name": "Henry Purcell",
        "shortName": "Purcell",
        "biography": "Engeland se grootste Barokkomponis. Purcell se merkwaardig uitdrukkingsvolle musiek het Italiaanse en Franse invloede op unieke wyse met Engelse tradisies vermeng. Sy opera Dido and Aeneas bevat een van die beroemdste klaaggesange in alle musiek, en sy teatermusiek het 'n standaard gestel wat in Engeland onoortroffe was tot die 20ste eeu.",
        "birthPlace": "Westminster, Engeland",
        "nationality": "Engels"
    },
    "antonio-vivaldi": {
        "name": "Antonio Vivaldi",
        "shortName": "Vivaldi",
        "biography": "Die \"Rooi Priester\" van Venesië. Vivaldi was een van die mees produktiewe en invloedryke Barokkomponiste. Sy konserte — veral Die Vier Seisoene — het die driedelige konsertvorm gevestig en generasies komponiste, insluitend Bach, beïnvloed. Hy het meer as 500 konserte en 46 operas geskryf.",
        "birthPlace": "Venesië, Republiek Venesië",
        "nationality": "Italiaans"
    },
    "georg-philipp-telemann": {
        "name": "Georg Philipp Telemann",
        "shortName": "Telemann",
        "biography": "Die mees produktiewe groot komponis in die geskiedenis. Telemann het meer as 3 000 werke geproduseer wat elke genre van sy tyd omspan. As musiekdirekteur van Hamburg se hoofkerke en die Oper am Gänsemarkt was hy die beroemdste Duitse komponis van sy generasie, wat selfs sy vriend J.S. Bach in hedendaagse reputasie oortref het.",
        "birthPlace": "Magdeburg, Duitsland",
        "nationality": "Duits"
    },
    "jean-philippe-rameau": {
        "name": "Jean-Philippe Rameau",
        "shortName": "Rameau",
        "biography": "Die vooraanstaande Franse komponis van die 18de eeu en 'n baanbrekende musiekteorietikus wie se Verhandeling oor Harmonie die grondslae vir moderne tonale teorie gelê het. Rameau het die Franse opera revolusioneer met werke van ongekende harmoniese rykdom en dramatiese krag, en het Lully opgevolg as die dominante mag in die Franse musiekteater.",
        "birthPlace": "Dijon, Frankryk",
        "nationality": "Frans"
    },
    "johann-sebastian-bach": {
        "name": "Johann Sebastian Bach",
        "shortName": "J.S. Bach",
        "biography": "Word dikwels beskou as die grootste komponis wat ooit geleef het. Bach het Barokkontrapunt tot sy opperste hoogte gevoer en werke van onoortroffe intellektuele diepte en emosionele krag geskep. Van die monumentale Mis in B mineur tot die intieme Tjellosuittes omvat sy musiek feitlik elke genre van sy era behalwe opera.",
        "birthPlace": "Eisenach, Sakse-Eisenach",
        "nationality": "Duits"
    },
    "george-frideric-handel": {
        "name": "George Frideric Handel",
        "shortName": "Handel",
        "biography": "Gebore in dieselfde jaar as Bach, het Handel die teenoorgestelde pad gevolg — kosmopolities, teatraal en enorm suksesvol in sy leeftyd. Sy operas het Londen se teaters oorheers, en toe modes verander, het hy homself heruitgevind as die vader van die Engelse oratorium. Messiah bly een van die mees uitgevoerde koorwerke in die geskiedenis.",
        "birthPlace": "Halle, Hertogdom Magdeburg",
        "nationality": "Duits-Brits"
    },
    "domenico-scarlatti": {
        "name": "Domenico Scarlatti",
        "shortName": "D. Scarlatti",
        "biography": "'n Virtuose klavesimbelist wat die grootste deel van sy loopbaan aan die Spaanse en Portugese howe deurgebring het. Scarlatti het meer as 550 klaversonates gekomponeer wat radikale nuwe tegnieke verken het. Sy eendelige sonates, met hul handkruispassasies, vinnige herhalings en Iberiese volksinvloede, het die uitdrukkings- en tegniese moontlikhede van klaviermusiek uitgebrei.",
        "birthPlace": "Napels, Italië",
        "nationality": "Italiaans"
    },
    "christoph-willibald-gluck": {
        "name": "Christoph Willibald Gluck",
        "shortName": "Gluck",
        "biography": "Die groot hervormer van opera wat die buitensporigheid van Barok-opera seria weggestroop het om 'n meer natuurlike, dramaties kragtige kunsvorm te skep. Sy hervormingsoperas, beginnende met Orfeo ed Euridice, het vokale vertoon aan dramatiese waarheid ondergeskik gestel en elke daaropvolgende operakomponis van Mozart tot Wagner beïnvloed.",
        "birthPlace": "Erasbach, Beiere",
        "nationality": "Duits-Boheems"
    },
    "joseph-haydn": {
        "name": "Joseph Haydn",
        "shortName": "Haydn",
        "biography": "Die \"Vader van die Simfonie\" en \"Vader van die Strykkwartet.\" Haydn se lang loopbaan aan die Esterházy-hof het hom die vryheid gegee om meedoënloos te eksperimenteer en die simfonie van 'n liggewig-vermaak tot 'n diepgaande artistieke verklaring te ontwikkel. Sy humor, vormvernuf en melodiese gawe het hom die mees gevierde komponis in Europa gemaak.",
        "birthPlace": "Rohrau, Aartshertogdom Oostenryk",
        "nationality": "Oostenryks"
    },
    "wolfgang-amadeus-mozart": {
        "name": "Wolfgang Amadeus Mozart",
        "shortName": "Mozart",
        "biography": "'n Wonderkind wat 'n reus geword het. Mozart se musiek bereik 'n perfeksie van vorm en uitdrukking wat byna bomenslik lyk. In sy kort 35 jaar het hy elke genre bemeester — simfonie, konsert, opera, kamermusiek, gewyde musiek — en elkeen met 'n diepte van gevoel en dramatiese krag deurdrenk wat die Klassieke era se ideale van balans en ingetoënheid oortref.",
        "birthPlace": "Salzburg, Aartsbiskopdom Salzburg",
        "nationality": "Oostenryks"
    },
    "ludwig-van-beethoven": {
        "name": "Ludwig van Beethoven",
        "shortName": "Beethoven",
        "biography": "Die komponis wat alles verander het. Beethoven het die Klassieke vorme van Haydn en Mozart geneem en hul grense verpletter, en Romantiese passie in strukture van ongekende skaal en dramatiese krag gegiet. Sy stryd teen doofheid is een van die musiek se grootste tragedies en triomfe — die Negende Simfonie, feitlik heeltemal doof gekomponeer, bly die mensdom se kragtigste musikale verklaring van broederskap.",
        "birthPlace": "Bonn, Keurvorstendom Keulen",
        "nationality": "Duits"
    },
    "niccolo-paganini": {
        "name": "Niccolò Paganini",
        "shortName": "Paganini",
        "biography": "Die mees legendariese vioolvirtuoos in die geskiedenis, wie se verstommende tegniek en verhoogteenwoordigheid gerugte van 'n duiwelse verbond laat ontstaan het. Paganini se 24 Caprices vir soloviool het 'n nuwe standaard vir instrumentale virtuositeit gestel wat Liszt, Schumann, Brahms en Rachmaninoff geïnspireer het om die grense van hul eie instrumente te verskuif.",
        "birthPlace": "Genua, Italië",
        "nationality": "Italiaans"
    },
    "carl-maria-von-weber": {
        "name": "Carl Maria von Weber",
        "shortName": "Weber",
        "biography": "Die vader van die Duitse Romantiese opera, wie se Der Freischütz 'n nuwe soort opera gevestig het wat gewortel is in Duitse volksverhale, bonatuurlike atmosfeer en orkestrale kleur. Weber se innovasies in orkestrasie en dramatiese karakterisering het die grondslag gelê vir Wagner se musiekdramas en die hele tradisie van Duitse operatiese Romantiek.",
        "birthPlace": "Eutin, Duitsland",
        "nationality": "Duits"
    },
    "franz-schubert": {
        "name": "Franz Schubert",
        "shortName": "Schubert",
        "biography": "Die opperste melodis. Schubert se gawe vir sang — meer as 600 Lieder — het die kunslied omskep in 'n diepgaande voertuig vir poësie en emosie. Hy het op 31 gesterf en 'n verstommende oeuvre nagelaat, insluitend die \"Onvoltooide\" Simfonie, die \"Grote\" C-majeur Simfonie, en van die mooiste kamermusiek ooit geskryf.",
        "birthPlace": "Wene, Oostenrykse Ryk",
        "nationality": "Oostenryks"
    },
    "hector-berlioz": {
        "name": "Hector Berlioz",
        "shortName": "Berlioz",
        "biography": "Die groot orkestrale innoveerder. Berlioz het die simfonie revolusioneer met die Symphonie fantastique, een van die musiek se eerste groot programmatiese werke — 'n hallusinerende, outobiografiese reis wat die orkes se palet op maniere uitgebrei het wat niemand hom kon voorstel nie. Sy Verhandeling oor Instrumentasie het die bybel van orkestrasie geword.",
        "birthPlace": "La Côte-Saint-André, Frankryk",
        "nationality": "Frans"
    },
    "felix-mendelssohn": {
        "name": "Felix Mendelssohn",
        "shortName": "Mendelssohn",
        "biography": "'n Romantikus met 'n Klassieke siel. Mendelssohn het Romantiese uitdrukkingskrag met Klassieke helderheid en elegansie gekombineer. Hy het Bach se musiek laat herleef, die Leipziger Konservatorium gestig, en werke van stralende skoonheid gekomponeer — van die skitterende \"Italiaanse\" Simfonie tot die eteriese A Midsummer Night's Dream-ouverture, geskryf op 17-jarige ouderdom.",
        "birthPlace": "Hamburg, Vrye Stad Hamburg",
        "nationality": "Duits"
    },
    "frederic-chopin": {
        "name": "Frédéric Chopin",
        "shortName": "Chopin",
        "biography": "Die digter van die klavier. Chopin het byna uitsluitlik vir sy instrument gekomponeer, maar binne daardie fokus 'n onoortroffe diepte van uitdrukking bereik. Sy nokturnes, études, preludes en ballades het herdefinieer wat die klavier kon sê. 'n Poolse balling in Parys, sy musiek is deurdrenk met sowel Slawiese weemoed as Paryse elegansie.",
        "birthPlace": "Żelazowa Wola, Hertogdom Warskou",
        "nationality": "Pools-Frans"
    },
    "robert-schumann": {
        "name": "Robert Schumann",
        "shortName": "R. Schumann",
        "biography": "Schumann was die tipiese Romantikus — passievol, literêr, verskeur tussen teenstrydige impulse wat hy as die karakters Florestan en Eusebius beliggaam het. Sy klavierwerke, liedere en simfonieë brand met poëtiese intensiteit. As kritikus het hy Chopin, Brahms en Berlioz verdedig en die Romantiese beweging self gevorm.",
        "birthPlace": "Zwickau, Koninkryk Sakse",
        "nationality": "Duits"
    },
    "franz-liszt": {
        "name": "Franz Liszt",
        "shortName": "Liszt",
        "biography": "Die eerste moderne superstermusikant. Liszt se virtuositeit op die klavier was legendaries — gehore het flou geword, onluste het uitgebreek. Maar agter die skouspel was hy 'n diepgaande innoveerder: hy het die simfoniese digstuk uitgevind, tematiese transformasie ontwikkel, en in sy laat werke harmonieë verken so radikaal dat hulle die 20ste eeu vooruitgeloop het.",
        "birthPlace": "Raiding, Oostenrykse Ryk",
        "nationality": "Hongaars"
    },
    "richard-wagner": {
        "name": "Richard Wagner",
        "shortName": "Wagner",
        "biography": "Die mees revolusionêre en omstrede figuur in 19de-eeuse musiek. Wagner se konsep van die Gesamtkunstwerk — die \"totale kunswerk\" — het musiek, drama, poësie en visuele skouspel in die monumentale musiekdramas van die Ring-siklus en Tristan und Isolde saamgesmelt. Sy chromatiese harmonie het tonaliteit tot sy breekpunt gedruk.",
        "birthPlace": "Leipzig, Koninkryk Sakse",
        "nationality": "Duits"
    },
    "giuseppe-verdi": {
        "name": "Giuseppe Verdi",
        "shortName": "Verdi",
        "biography": "Die Shakespeariaanse dramaturg van opera. Verdi se operas — Rigoletto, La Traviata, Aida, Otello, Falstaff — kombineer onweerstaanbare melodie met vernietigende sielkundige insig. Hy was ook 'n simbool van Italiaanse eenwording; \"Viva VERDI!\" het 'n politieke slagspreuk geword (staande vir \"Vittorio Emanuele Re D'Italia\").",
        "birthPlace": "Le Roncole, Hertogdom Parma",
        "nationality": "Italiaans"
    },
    "cesar-franck": {
        "name": "César Franck",
        "shortName": "Franck",
        "biography": "'n Diep geestelike orrelis-komponis wat die vereerde onderwyser van 'n hele generasie Franse musikante geword het. Franck se rypste werke — meestal in die laaste dekade van sy lewe gekomponeer — het sikliese vorm en chromatiese harmonie ingelei wat Debussy, Ravel en die Franse simfoniese tradisie diepgaande beïnvloed het.",
        "birthPlace": "Luik, België",
        "nationality": "Belgies-Frans"
    },
    "bedrich-smetana": {
        "name": "Bedřich Smetana",
        "shortName": "Smetana",
        "biography": "Die vader van Tsjeggiese musiek. Smetana het 'n nasionale musikale identiteit gesmee deur werke wat deurdrenk is met Bohemse volkstradisies en patriotiese sentiment. Sy siklus van simfoniese digstukke Má vlast en die opera Die Verhandelde Bruid bly hoekstene van Tsjeggiese kultuur, gekomponeer selfs terwyl progressiewe doofheid hom oorval het.",
        "birthPlace": "Litomyšl, Boheme",
        "nationality": "Tsjeggies"
    },
    "johannes-brahms": {
        "name": "Johannes Brahms",
        "shortName": "Brahms",
        "biography": "Die groot konserwatief-progressief. Brahms het teen die \"Nuwe Musiek\" van Wagner en Liszt gestaan en Klassieke vorme verdedig — maar hulle met sulke harmoniese rykdom, ritmiese kompleksiteit en emosionele diepte gevul dat hy hulle van binne af uitgebrei het. Sy vier simfonieë, die Duitse Requiem en sy kamermusiek is hoekstene van die repertorium.",
        "birthPlace": "Hamburg, Duitse Bond",
        "nationality": "Duits"
    },
    "alexander-borodin": {
        "name": "Alexander Borodin",
        "shortName": "Borodin",
        "biography": "'n Vooraanstaande chemikus en lid van die nasionalistiese groep bekend as Die Vyf. Borodin het relatief min werke gekomponeer, maar elkeen is 'n meesterstuk van melodiese rykdom en eksotiese kleur. Sy onvoltooide opera Prins Igor en die orkestrale toondig In die Steppe van Sentraal-Asië vang die uitgestrekte landskappe en Oosterse invloede van die Russiese verbeelding.",
        "birthPlace": "Sint Petersburg, Rusland",
        "nationality": "Russies"
    },
    "camille-saint-saens": {
        "name": "Camille Saint-Saëns",
        "shortName": "Saint-Saëns",
        "biography": "'n Wonderkind van Mozartiaanse vroeërypheid. Saint-Saëns het die oudste staatsman van Franse musiek geword deur 'n loopbaan wat meer as sewe dekades strek. Sy elegante vakmanskap het blywende werke in elke genre gelewer — van die Orrelsimfonie en klavierkonserte tot die speelse Karneval van die Diere — waarin hy klassieke vorm met Romantiese kleur en Franse helderheid vermeng het.",
        "birthPlace": "Parys, Frankryk",
        "nationality": "Frans"
    },
    "modest-mussorgsky": {
        "name": "Modest Mussorgsky",
        "shortName": "Mussorgsky",
        "biography": "Die mees gewaagd oorspronklike van Die Vyf. Mussorgsky het Wes-Europese akademiese konvensies verwerp om 'n rou, eiesoortig Russiese musikale taal te smee. Sy opera Boris Godoenof en die klaviersuite Skilderye by 'n Uitstalling openbaar 'n kompromislose visie — robuust, harmonies gedurfd en diep gewortel in die ritmes van Russiese spraak en volkslewe.",
        "birthPlace": "Karevo, Rusland",
        "nationality": "Russies"
    },
    "pyotr-ilyich-tchaikovsky": {
        "name": "Pyotr Ilyich Tchaikovsky",
        "shortName": "Tchaikovsky",
        "biography": "Rusland se mees geliefde komponis. Tchaikovsky se musiek pols met intense, dikwels gekwelde emosie — die desperate passie van Romeo en Juliet, die grandeur van die 1812-ouverture, die sprokie-betowering van Swanemeer en Die Neutekraker. Sy ses simfonieë stip 'n diep persoonlike reis uit van jeugdige energie tot die verpletterende wanhoop van die Pathétique.",
        "birthPlace": "Votkinsk, Russiese Ryk",
        "nationality": "Russies"
    },
    "antonin-dvorak": {
        "name": "Antonín Dvořák",
        "shortName": "Dvořák",
        "biography": "Die stem van Boheme. Dvořák het Tsjeggiese volksmusiek met onweerstaanbare warmte en kleur in die simfoniese hoofstroom gebring. Sy \"Nuwe Wêreld\"-simfonie, gekomponeer tydens sy tyd in Amerika, is een van die gewildste simfonieë ooit geskryf. Sy tjellokonsert het Brahms laat uitroep: \"Hoekom het ek nie geweet 'n mens kan so 'n tjellokonsert skryf nie?\"",
        "birthPlace": "Nelahozeves, Oostenrykse Ryk",
        "nationality": "Tsjeggies"
    },
    "edvard-grieg": {
        "name": "Edvard Grieg",
        "shortName": "Grieg",
        "biography": "Noorweë se grootste komponis. Grieg het die landskappe, volksverhale en gees van Skandinawië in musiek van buitengewone kleur en bekoring vasgevang. Sy Klavierkonsert en Peer Gynt-suites is onder die gewildste werke in die Romantiese repertorium, en sy Liriese Stukke vir klavier is miniatuurjuwele van Nordiese poësie.",
        "birthPlace": "Bergen, Noorweë",
        "nationality": "Noorweegs"
    },
    "nikolai-rimsky-korsakov": {
        "name": "Nikolai Rimsky-Korsakov",
        "shortName": "Rimsky-Korsakov",
        "biography": "Die opperste orkestreerder van die 19de eeu en die rigtinggewende figuur van die Russiese nasionalistiese skool. As lid van Die Vyf en invloedryke onderwyser van Stravinsky en Prokofiev het Rimsky-Korsakov die koers van Russiese musiek gevorm deur sy glinsterende orkestrale sprokie-operas en die beroemde orkestrasie-verhandeling wat 'n standaardnaslaanwerk bly.",
        "birthPlace": "Tichwin, Rusland",
        "nationality": "Russies"
    },
    "edward-elgar": {
        "name": "Edward Elgar",
        "shortName": "Elgar",
        "biography": "Die komponis wat eiehandig Engeland se twee-eeue-lange droogte van groot orkesmusiek beëindig het. Elgar se Enigma Variations en twee simfonieë het Engelse musiek in die Europese hoofstroom gebring, terwyl sy Tjellokonsert — 'n afskeid geskryf na die verwoesting van die Eerste Wêreldoorlog — onder die mees aangrypende werke van die 20ste eeu staan.",
        "birthPlace": "Broadheath, Engeland",
        "nationality": "Engels"
    },
    "giacomo-puccini": {
        "name": "Giacomo Puccini",
        "shortName": "Puccini",
        "biography": "Die laaste groot meester van die Italiaanse opera, wie se gawe vir swewende melodie en teatrale instink van die mees geliefde werke in die repertorium gelewer het. La bohème, Tosca, Madama Butterfly en die onvoltooide Turandot kombineer verismo-realisme met weelderige orkestrasie en 'n foutlose sin vir dramatiese pas.",
        "birthPlace": "Lucca, Italië",
        "nationality": "Italiaans"
    },
    "gustav-mahler": {
        "name": "Gustav Mahler",
        "shortName": "Mahler",
        "biography": "Die laaste groot Romantiese simfonis — en die eerste stem van die moderniteit. Mahler se tien simfonieë is uitgestrekte, kosmos-omspannende werke wat alles omvat: volkslied en begrafnismars, voëlsang en apokalips, tere intimiteit en verpletterende klimaks. \"'n Simfonie moet soos die wêreld wees,\" het hy gesê. \"Dit moet alles bevat.\"",
        "birthPlace": "Kaliště, Oostenrykse Ryk",
        "nationality": "Oostenryks-Boheems"
    },
    "claude-debussy": {
        "name": "Claude Debussy",
        "shortName": "Debussy",
        "biography": "Die stigter van musikale Impressionisme — hoewel hy die term gehaat het. Debussy het tradisionele harmonie in glinsterende wasse van kleur opgelos en 'n nuwe musikale taal geskep, geïnspireer deur Simbolistiese poësie, Japanse kuns en die klanke van die natuur. Prélude à l'après-midi d'un faune word dikwels die begin van moderne musiek genoem.",
        "birthPlace": "Saint-Germain-en-Laye, Frankryk",
        "nationality": "Frans"
    },
    "richard-strauss": {
        "name": "Richard Strauss",
        "shortName": "R. Strauss",
        "biography": "Meester van die orkestrale toondig en opera. Strauss se skitterende orkestrasie en dramatiese instink het werke van verstommende virtuositeit gelewer — Also sprach Zarathustra, Der Rosenkavalier, die Vier Laaste Liedere. Hy het lank genoeg geleef om die hele Moderne era te omspan en het baie oorleef wat Romantiek dood verklaar het.",
        "birthPlace": "München, Koninkryk Beiere",
        "nationality": "Duits"
    },
    "jean-sibelius": {
        "name": "Jean Sibelius",
        "shortName": "Sibelius",
        "biography": "Finland se nasionale komponis en een van die laaste groot simfoniste. Sibelius het inspirasie geput uit Finse mitologie en die streng Nordiese landskap. Sy sewe simfonieë stip 'n merkwaardige reis uit van laat-Romantiese grandeur tot 'n byna mistieke kompressie van vorm, terwyl Finlandia 'n onamptelike volkslied van Finse onafhanklikheid geword het.",
        "birthPlace": "Hämeenlinna, Finland",
        "nationality": "Fins"
    },
    "erik-satie": {
        "name": "Erik Satie",
        "shortName": "Satie",
        "biography": "'n Eksentrieke visioenêr wat minimalisme, omgewingsmusiek en die avant-garde dekades voordat hulle na vore gekom het, geanitisipeer het. Satie se bedrieglik eenvoudige klavierstukke — die Gymnopédies, Gnossiennes en uitdagend betitelde Vexations — het elke konvensie van Romantiese oordadigheid uitgedaag en Debussy, Ravel, Cage en die hele trajek van 20ste-eeuse musiek diepgaande beïnvloed.",
        "birthPlace": "Honfleur, Frankryk",
        "nationality": "Frans"
    },
    "sergei-rachmaninoff": {
        "name": "Sergei Rachmaninoff",
        "shortName": "Rachmaninoff",
        "biography": "Die laaste groot Romantiese pianis-komponis. Rachmaninoff se musiek word gedefinieer deur swepende melodie, weelderige harmonie en die mees veeleisende klavierskryfwerk in die repertorium — alles deur die komponis self met legendariese virtuositeit gespeel. Sy Klavierkonsert Nr. 2 en Nr. 3 bly wêreldwyd gehoorgunstelinge.",
        "birthPlace": "Semjonowo, Russiese Ryk",
        "nationality": "Russies"
    },
    "arnold-schoenberg": {
        "name": "Arnold Schoenberg",
        "shortName": "Schoenberg",
        "biography": "Die mees radikale innoveerder in Westerse musiekgeskiedenis. Schoenberg se reis van weelderige post-Romantiek deur \"vrye atonaliteit\" tot die sistematiese twaaftoontegniek het die fondamente van musikale komposisie hervorm. Sy werk het die musikale wêreld verdeel, maar sy invloed — deur studente Berg en Webern — is onberekenbaar.",
        "birthPlace": "Wene, Oostenryk-Hongarye",
        "nationality": "Oostenryks-Amerikaans"
    },
    "maurice-ravel": {
        "name": "Maurice Ravel",
        "shortName": "Ravel",
        "biography": "Die Switserse horlosiemaker van musiek — elke noot presies geplaas. Ravel se orkestrasie is die skitterendste in alle musiek (sy orkestrasie van Mussorgsky se Skilderye by 'n Uitstalling is beroemder as die oorspronklike). Boléro se hipnotiese crescendo, Daphnis et Chloé se dagbreek-toneel en sy twee klavierkonserte is wonders van kleur en vakmanskap.",
        "birthPlace": "Ciboure, Frankryk",
        "nationality": "Frans"
    },
    "bela-bartok": {
        "name": "Béla Bartók",
        "shortName": "Bartók",
        "biography": "Bartók het die rou energie van Hongaarse, Roemeense en Slowaakse volksmusiek met modernistiese tegnieke saamgesmelt en 'n unieke en kragtige musikale taal geskep. Sy ses strykkwartette word beskou as die belangrikste sedert Beethoven s'n. Die Konsert vir Orkes en Musiek vir Strykers, Perkussie en Celesta is pilare van die 20ste-eeuse repertorium.",
        "birthPlace": "Nagyszentmiklós, Oostenryk-Hongarye",
        "nationality": "Hongaars"
    },
    "igor-stravinsky": {
        "name": "Igor Stravinsky",
        "shortName": "Stravinsky",
        "biography": "Die verkleurmannetjie van moderne musiek. Stravinsky se Die Lentewyding het 'n oproer by sy 1913-première veroorsaak en musiek vir altyd verander met sy barbaarse ritmes en politonale botsings. Hy het homself toe heruitgevind as 'n neoklassisis, toe 'n serialis — elke fase het meesterstukke gelewer. Hy bly die mees invloedryke komponis van die 20ste eeu.",
        "birthPlace": "Oranienbaum, Russiese Ryk",
        "nationality": "Russies-Amerikaans"
    },
    "sergei-prokofiev": {
        "name": "Sergei Prokofiev",
        "shortName": "Prokofiev",
        "biography": "'n Modernis met 'n onbedwingbare melodiese gawe. Prokofiev se musiek borrel van motorritmes, bytende geestigheid en onverwagte liriek. Van die sprokie Peter en die Wolf tot die filmiese Romeo en Juliet-ballet, van die satiriese Klassieke Simfonie tot die oorlogstydse Klaviersonates, is sy reikwydte en lewenskrag buitengewoon.",
        "birthPlace": "Sontsiwka, Russiese Ryk",
        "nationality": "Russies-Sowjet"
    },
    "paul-hindemith": {
        "name": "Paul Hindemith",
        "shortName": "Hindemith",
        "biography": "'n Veelsydige komponis, virtuose altviolis en invloedryke teorietikus wat een van die vooraanstaande figure van 20ste-eeuse neoklassisisme geword het. Hindemith se Gebrauchsmusik-filosofie het praktiese, toeganklike komposisie verdedig, terwyl werke soos Mathis der Maler en sy omvattende verhandeling Die Ambag van Musikale Komposisie moderne musiekopvoeding gevorm het.",
        "birthPlace": "Hanau, Duitsland",
        "nationality": "Duits-Amerikaans"
    },
    "aaron-copland": {
        "name": "Aaron Copland",
        "shortName": "Copland",
        "biography": "Die dekaan van Amerikaanse komponiste. Copland het 'n eiesoortig Amerikaanse klank gesmee uit jazzritmes, volksmelodieë en wyd-oop harmonieë wat die uitgestrektheid van die Amerikaanse landskap oproep. Sy ballette Appalachian Spring, Billy the Kid en Rodeo het musikale Americana gedefinieer, terwyl sy onderrig en voorspraak generasies Amerikaanse komponiste gevorm het.",
        "birthPlace": "Brooklyn, New York, VSA",
        "nationality": "Amerikaans"
    },
    "dmitri-shostakovich": {
        "name": "Dmitri Shostakovich",
        "shortName": "Shostakovich",
        "biography": "Die stem van Sowjet-lyding. Shostakovich het onder konstante bedreiging van Stalin se regime geleef, en sy 15 simfonieë en 15 strykkwartette enkodeer 'n leeftyd van vrees, verset, donker humor en droefheid. Sy Vyfde Simfonie — beskryf as \"'n Sowjet-kunstenaar se kreatiewe antwoord op regverdige kritiek\" — is een van die mees gedebatteerde werke in musiek: triomf of ironie?",
        "birthPlace": "Sint Petersburg, Russiese Ryk",
        "nationality": "Russies-Sowjet"
    },
    "benjamin-britten": {
        "name": "Benjamin Britten",
        "shortName": "Britten",
        "biography": "Die grootste Engelse operakomponis sedert Purcell. Britten het Engelse musiek laat herleef met werke van buitengewone dramatiese krag en tegniese meesterskap. Van Peter Grimes tot The Turn of the Screw en die War Requiem het sy oeuvre toeganklikheid met modernistiese sofistikasie gekombineer en Aldeburgh as 'n belangrike sentrum van die musieklewe gevestig.",
        "birthPlace": "Lowestoft, Engeland",
        "nationality": "Engels"
    }
}

out_dir = r"D:\Requiem of Everything\public\locales\af-ZA"
with open(os.path.join(out_dir, "composers.json"), "w", encoding="utf-8") as f:
    json.dump(composers_af, f, indent=2, ensure_ascii=False)
print(f"composers.json created successfully with {len(composers_af)} composers")
