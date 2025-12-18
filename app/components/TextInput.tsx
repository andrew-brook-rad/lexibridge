'use client'

import { useState } from 'react'

interface TextInputProps {
  onTranslate: (text: string) => void
  isLoading: boolean
}

const SAMPLE_TEXT = `1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht. 4 Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis 5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.

6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also. 8 Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der andere Tag.`

const MULTI_CHAPTER_SAMPLE = `Chapter 1
1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht.

Chapter 2
1 Also ward vollendet Himmel und Erde mit ihrem ganzen Heer. 2 Und also vollendete Gott am siebenten Tage seine Werke, die er machte. 3 Und Gott segnete den siebenten Tag und heiligte ihn.`

const GENESIS_1_10 = `Chapter 1
1 Am Anfang schuf Gott Himmel und Erde. 2 Und die Erde war wüst und leer, und es war finster auf der Tiefe; und der Geist Gottes schwebte auf dem Wasser. 3 Und Gott sprach: Es werde Licht! und es ward Licht. 4 Und Gott sah, daß das Licht gut war. Da schied Gott das Licht von der Finsternis 5 und nannte das Licht Tag und die Finsternis Nacht. Da ward aus Abend und Morgen der erste Tag.

6 Und Gott sprach: Es werde eine Feste zwischen den Wassern, und die sei ein Unterschied zwischen den Wassern. 7 Da machte Gott die Feste und schied das Wasser unter der Feste von dem Wasser über der Feste. Und es geschah also. 8 Und Gott nannte die Feste Himmel. Da ward aus Abend und Morgen der andere Tag.

9 Und Gott sprach: Es sammle sich das Wasser unter dem Himmel an besondere Örter, daß man das Trockene sehe. Und es geschah also. 10 Und Gott nannte das Trockene Erde, und die Sammlung der Wasser nannte er Meer. Und Gott sah, daß es gut war. 11 Und Gott sprach: Es lasse die Erde aufgehen Gras und Kraut, das sich besame, und fruchtbare Bäume, da ein jeglicher nach seiner Art Frucht trage und habe seinen eigenen Samen bei sich selbst auf Erden. Und es geschah also. 12 Und die Erde ließ aufgehen Gras und Kraut, das sich besamte, ein jegliches nach seiner Art, und Bäume, die da Frucht trugen und ihren eigenen Samen bei sich selbst hatten, ein jeglicher nach seiner Art. Und Gott sah, daß es gut war. 13 Da ward aus Abend und Morgen der dritte Tag.

14 Und Gott sprach: Es werden Lichter an der Feste des Himmels, die da scheiden Tag und Nacht und geben Zeichen, Zeiten, Tage und Jahre 15 und seien Lichter an der Feste des Himmels, daß sie scheinen auf Erden. Und es geschah also. 16 Und Gott machte zwei große Lichter: ein großes Licht, das den Tag regiere, und ein kleines Licht, das die Nacht regiere, dazu auch Sterne. 17 Und Gott setzte sie an die Feste des Himmels, daß sie schienen auf die Erde 18 und den Tag und die Nacht regierten und schieden Licht und Finsternis. Und Gott sah, daß es gut war. 19 Da ward aus Abend und Morgen der vierte Tag.

20 Und Gott sprach: Es errege sich das Wasser mit webenden und lebendigen Tieren, und Gevögel fliege auf Erden unter der Feste des Himmels. 21 Und Gott schuf große Walfische und allerlei Getier, das da lebt und webt, davon das Wasser sich erregte, ein jegliches nach seiner Art, und allerlei gefiedertes Gevögel, ein jegliches nach seiner Art. Und Gott sah, daß es gut war. 22 Und Gott segnete sie und sprach: Seid fruchtbar und mehrt euch und erfüllt das Wasser im Meer; und das Gefieder mehre sich auf Erden. 23 Da ward aus Abend und Morgen der fünfte Tag.

24 Und Gott sprach: Die Erde bringe hervor lebendige Tiere, ein jegliches nach seiner Art: Vieh, Gewürm und Tiere auf Erden, ein jegliches nach seiner Art. Und es geschah also. 25 Und Gott machte die Tiere auf Erden, ein jegliches nach seiner Art, und das Vieh nach seiner Art, und allerlei Gewürm auf Erden nach seiner Art. Und Gott sah, daß es gut war.

26 Und Gott sprach: Laßt uns Menschen machen, ein Bild, das uns gleich sei, die da herrschen über die Fische im Meer und über die Vögel unter dem Himmel und über das Vieh und über die ganze Erde und über alles Gewürm, das auf Erden kriecht. 27 Und Gott schuf den Menschen ihm zum Bilde, zum Bilde Gottes schuf er ihn; und schuf sie einen Mann und ein Weib. 28 Und Gott segnete sie und sprach zu ihnen: Seid fruchtbar und mehrt euch und füllt die Erde und macht sie euch untertan und herrscht über die Fische im Meer und über die Vögel unter dem Himmel und über alles Getier, das auf Erden kriecht. 29 Und Gott sprach: Seht da, ich habe euch gegeben allerlei Kraut, das sich besamt, auf der ganzen Erde und allerlei fruchtbare Bäume, die sich besamen, zu eurer Speise, 30 und allem Getier auf Erden und allen Vögeln unter dem Himmel und allem Gewürm, das da lebt auf Erden, daß sie allerlei grünes Kraut essen. Und es geschah also. 31 Und Gott sah alles an, was er gemacht hatte; und siehe da, es war sehr gut. Da ward aus Abend und Morgen der sechste Tag.

Chapter 2
1 Also ward vollendet Himmel und Erde mit ihrem ganzen Heer. 2 Und also vollendete Gott am siebenten Tage seine Werke, die er machte, und ruhte am siebenten Tage von allen seinen Werken, die er machte. 3 Und Gott segnete den siebenten Tag und heiligte ihn, darum daß er an demselben geruht hatte von allen seinen Werken, die Gott schuf und machte.

4 Also ist Himmel und Erde geworden, da sie geschaffen sind, zu der Zeit, da Gott der HERR Erde und Himmel machte. 5 Und allerlei Bäume auf dem Felde waren noch nicht auf Erden, und allerlei Kraut auf dem Felde war noch nicht gewachsen; denn Gott der HERR hatte noch nicht regnen lassen auf Erden, und es war kein Mensch, der das Land baute. 6 Aber ein Nebel ging auf von der Erde und feuchtete alles Land. 7 Und Gott der HERR machte den Menschen aus einem Erdenkloß, und er blies ihm ein den lebendigen Odem in seine Nase. Und also ward der Mensch eine lebendige Seele.

8 Und Gott der HERR pflanzte einen Garten in Eden gegen Morgen und setzte den Menschen hinein, den er gemacht hatte. 9 Und Gott der HERR ließ aufwachsen aus der Erde allerlei Bäume, lustig anzusehen und gut zu essen, und den Baum des Lebens mitten im Garten und den Baum der Erkenntnis des Guten und Bösen.

10 Und es ging aus von Eden ein Strom, zu wässern den Garten, und teilte sich von da in vier Hauptwasser. 11 Das erste heißt Pison, das fließt um das ganze Land Hevila; und daselbst findet man Gold. 12 Und das Gold des Landes ist köstlich; und da findet man Bedellion und den Edelstein Onyx. 13 Das andere Wasser heißt Gihon, das fließt um das ganze Mohrenland. 14 Das dritte Wasser heißt Hiddekel, das fließt vor Assyrien. Das vierte Wasser ist der Euphrat.

15 Und Gott der HERR nahm den Menschen und setzte ihn in den Garten Eden, daß er ihn baute und bewahrte. 16 Und Gott der HERR gebot dem Menschen und sprach: Du sollst essen von allerlei Bäumen im Garten; 17 aber von dem Baum der Erkenntnis des Guten und Bösen sollst du nicht essen; denn welches Tages du davon issest, wirst du des Todes sterben.

18 Und Gott der HERR sprach: Es ist nicht gut, daß der Mensch allein sei; ich will ihm eine Gehilfin machen, die um ihn sei. 19 Denn als Gott der HERR gemacht hatte von der Erde allerlei Tiere auf dem Felde und allerlei Vögel unter dem Himmel, brachte er sie zu dem Menschen, daß er sähe, wie er sie nennte; denn wie der Mensch allerlei lebendige Tiere nennen würde, so sollten sie heißen. 20 Und der Mensch gab einem jeglichen Vieh und Vogel unter dem Himmel und Tier auf dem Felde seinen Namen; aber für den Menschen ward keine Gehilfin gefunden, die um ihn wäre.

21 Da ließ Gott der HERR einen tiefen Schlaf fallen auf den Menschen, und er entschlief. Und er nahm seiner Rippen eine und schloß die Stätte zu mit Fleisch. 22 Und Gott der HERR baute ein Weib aus der Rippe, die er vom Menschen nahm, und brachte sie zu ihm. 23 Da sprach der Mensch: Das ist doch Bein von meinem Bein und Fleisch von meinem Fleisch; man wird sie Männin heißen, darum daß sie vom Manne genommen ist. 24 Darum wird ein Mann Vater und Mutter verlassen und an seinem Weibe hangen, und sie werden sein ein Fleisch. 25 Und sie waren beide nackt, der Mensch und das Weib, und schämten sich nicht.

Chapter 3
1 Und die Schlange war listiger denn alle Tiere auf dem Felde, die Gott der HERR gemacht hatte, und sprach zu dem Weibe: Ja, sollte Gott gesagt haben: Ihr sollt nicht essen von allerlei Bäumen im Garten? 2 Da sprach das Weib zu der Schlange: Wir essen von den Früchten der Bäume im Garten; 3 aber von den Früchten des Baumes mitten im Garten hat Gott gesagt: Esset nicht davon, rührt's auch nicht an, daß ihr nicht sterbet. 4 Da sprach die Schlange zum Weibe: Ihr werdet mit nichten des Todes sterben; 5 sondern Gott weiß, daß, welches Tages ihr davon esset, so werden eure Augen aufgetan, und werdet sein wie Gott und wissen, was gut und böse ist.

6 Und das Weib schaute an, daß von dem Baum gut zu essen wäre und daß er lieblich anzusehen und ein lustiger Baum wäre, weil er klug machte; und sie nahm von der Frucht und aß und gab ihrem Mann auch davon, und er aß. 7 Da wurden ihrer beider Augen aufgetan, und sie wurden gewahr, daß sie nackt waren, und flochten Feigenblätter zusammen und machten sich Schürze.

8 Und sie hörten die Stimme Gottes des HERRN, der im Garten ging, da der Tag kühl geworden war. Und Adam versteckte sich mit seinem Weibe vor dem Angesicht Gottes des HERRN unter die Bäume im Garten. 9 Und Gott der HERR rief Adam und sprach zu ihm: Wo bist du? 10 Und er sprach: Ich hörte deine Stimme im Garten und fürchtete mich; denn ich bin nackt, darum versteckte ich mich. 11 Und er sprach: Wer hat dir's gesagt, daß du nackt bist? Hast du nicht gegessen von dem Baum, davon ich dir gebot, du solltest nicht davon essen? 12 Da sprach Adam: Das Weib, das du mir zugesellt hast, gab mir von dem Baum, und ich aß.

13 Da sprach Gott der HERR zum Weibe: Warum hast du das getan? Das Weib sprach: Die Schlange betrog mich also, daß ich aß. 14 Da sprach Gott der HERR zu der Schlange: Weil du solches getan hast, seist du verflucht vor allem Vieh und vor allen Tieren auf dem Felde. Auf deinem Bauche sollst du gehen und Erde essen dein Leben lang. 15 Und ich will Feindschaft setzen zwischen dir und dem Weibe und zwischen deinem Samen und ihrem Samen. Derselbe soll dir den Kopf zertreten, und du wirst ihn in die Ferse stechen.

16 Und zum Weibe sprach er: Ich will dir viel Schmerzen schaffen, wenn du schwanger wirst; du sollst mit Schmerzen Kinder gebären; und dein Verlangen soll nach deinem Manne sein, und er soll dein Herr sein. 17 Und zu Adam sprach er: Dieweil du hast gehorcht der Stimme deines Weibes und hast gegessen von dem Baum, davon ich dir gebot und sprach: Du sollst nicht davon essen, verflucht sei der Acker um deinetwillen, mit Kummer sollst du dich darauf nähren dein Leben lang. 18 Dornen und Disteln soll er dir tragen, und sollst das Kraut auf dem Felde essen. 19 Im Schweiße deines Angesichts sollst du dein Brot essen, bis daß du wieder zu Erde werdest, davon du genommen bist. Denn du bist Erde und sollst zu Erde werden.

20 Und Adam hieß sein Weib Eva, darum daß sie eine Mutter ist aller Lebendigen. 21 Und Gott der HERR machte Adam und seinem Weibe Röcke von Fellen und kleidete sie. 22 Und Gott der HERR sprach: Siehe, Adam ist geworden wie unsereiner und weiß, was gut und böse ist. Nun aber, daß er nicht ausstrecke seine Hand und breche auch von dem Baum des Lebens und esse und lebe ewiglich! 23 Da ließ ihn Gott der HERR aus dem Garten Eden, daß er das Feld baute, davon er genommen ist, 24 und trieb Adam aus und lagerte vor den Garten Eden die Cherubim mit dem bloßen, hauenden Schwert, zu bewahren den Weg zu dem Baum des Lebens.

Chapter 4
1 Und Adam erkannte sein Weib Eva, und sie ward schwanger und gebar den Kain und sprach: Ich habe einen Mann gewonnen mit dem HERRN. 2 Und sie fuhr fort und gebar Abel, seinen Bruder. Und Abel ward ein Schäfer; Kain aber ward ein Ackermann.

3 Es begab sich nach etlicher Zeit, daß Kain dem HERRN Opfer brachte von den Früchten des Feldes; 4 und Abel brachte auch von den Erstlingen seiner Herde und von ihrem Fett. Und der HERR sah gnädig an Abel und sein Opfer; 5 aber Kain und sein Opfer sah er nicht gnädig an. Da ergrimmte Kain sehr, und seine Gebärde verstellte sich. 6 Da sprach der HERR zu Kain: Warum ergrimmst du? und warum verstellt sich deine Gebärde? 7 Ist's nicht also? Wenn du fromm bist, so bist du angenehm; bist du aber nicht fromm, so ruht die Sünde vor der Tür, und nach dir hat sie Verlangen; du aber herrsche über sie.

8 Da redete Kain mit seinem Bruder Abel. Und es begab sich, da sie auf dem Felde waren, erhob sich Kain wider seinen Bruder Abel und schlug ihn tot. 9 Da sprach der HERR zu Kain: Wo ist dein Bruder Abel? Er sprach: Ich weiß nicht; soll ich meines Bruders Hüter sein? 10 Er aber sprach: Was hast du getan? Die Stimme des Bluts deines Bruders schreit zu mir von der Erde. 11 Und nun verflucht seist du auf der Erde, die ihr Maul hat aufgetan und deines Bruders Blut von deinen Händen empfangen. 12 Wenn du den Acker bauen wirst, soll er dir hinfort sein Vermögen nicht geben. Unstet und flüchtig sollst du sein auf Erden.

13 Kain aber sprach zu dem HERRN: Meine Sünde ist größer, denn daß sie mir vergeben werden möge. 14 Siehe, du treibst mich heute aus dem Lande, und ich muß mich vor deinem Angesicht verbergen und muß unstet und flüchtig sein auf Erden. So wird mir's gehen, daß mich totschlage, wer mich findet. 15 Aber der HERR sprach zu ihm: Nein; sondern wer Kain totschlägt, das soll siebenfältig gerächt werden. Und der HERR machte ein Zeichen an Kain, daß ihn niemand erschlüge, wer ihn fände. 16 Also ging Kain von dem Angesicht des HERRN und wohnte im Lande Nod, jenseits Eden, gegen Morgen.

17 Und Kain erkannte sein Weib; die ward schwanger und gebar den Henoch. Und er baute eine Stadt, die nannte er nach seines Sohnes Namen Henoch. 18 Henoch aber zeugte Irad, Irad zeugte Mahujael, Mahujael zeugte Methusael, Methusael zeugte Lamech. 19 Lamech aber nahm zwei Weiber; eine hieß Ada, die andere Zilla. 20 Und Ada gebar Jabal; von dem sind hergekommen, die in Hütten wohnen und Vieh ziehen. 21 Und sein Bruder hieß Jubal; von dem sind hergekommen die Geiger und Pfeifer. 22 Die Zilla aber gebar auch, nämlich den Thubalkain, den Meister in allerlei Erz-und Eisenwerk. Und die Schwester des Thubalkain war Naema.

23 Und Lamech sprach zu seinen Weibern Ada und Zilla: Ihr Weiber Lamechs, hört meine Rede und merkt, was ich sage: Ich habe einen Mann erschlagen mir zur Wunde und einen Jüngling mir zur Beule. 24 Kain soll siebenmal gerächt werden; aber Lamech siebenundsiebzigmal.

25 Adam erkannte abermals sein Weib, und sie gebar einen Sohn, den hieß sie Seth; denn Gott hat mir, sprach sie, einen andern Samen gesetzt für Abel, den Kain erwürgt hat. 26 Und Seth zeugte auch einen Sohn und hieß ihn Enos. Zu der Zeit fing man an, zu predigen von des HERRN Namen.

Chapter 5
1 Dies ist das Buch von des Menschen Geschlecht. Da Gott den Menschen schuf, machte er ihn nach dem Bilde Gottes; 2 und schuf sie einen Mann und ein Weib und segnete sie und hieß ihren Namen Mensch, zur Zeit, da sie geschaffen wurden.

3 Und Adam war hundertunddreißig Jahre alt und zeugte einen Sohn, der seinem Bilde ähnlich war und hieß ihn Seth; 4 und lebte darnach achthundert Jahre und zeugte Söhne und Töchter; 5 daß sein ganzes Alter ward neunhundertunddreißig Jahre, und starb.

6 Seth war hundertundfünf Jahre alt und zeugte Enos 7 und lebte darnach achthundertundsieben Jahre und zeugte Söhne und Töchter; 8 daß sein ganzes Alter ward neunhundertundzwölf Jahre, und starb.

9 Enos war neunzig Jahre alt und zeugte Kenan 10 und lebte darnach achthundertundfünfzehn Jahre und zeugte Söhne und Töchter; 11 daß sein ganzes Alter ward neunhundertundfünf Jahre, und starb.

12 Kenan war siebzig Jahre alt und zeugte Mahalaleel 13 und lebte darnach achthundertvierzig Jahre und zeugte Söhne und Töchter; 14 daß sein ganzes Alter ward neunhundertundzehn Jahre, und starb.

15 Mahalaleel war fünfundsechzig Jahre alt und zeugte Jared 16 und lebte darnach achthundertunddreißig Jahre und zeugte Söhne und Töchter; 17 daß sein ganzes Alter ward achthundertfünfundneunzig Jahre, und starb.

18 Jared war hundertzweiundsechzig Jahre alt und zeugte Henoch 19 und lebte darnach achthundert Jahre und zeugte Söhne und Töchter; 20 daß sein ganzes Alter ward neunhundertzweiundsechzig Jahre, und starb.

21 Henoch war fünfundsechzig Jahre alt und zeugte Methusalah 22 und wandelte mit Gott nach der Geburt Methusalahs dreihundert Jahre und zeugte Söhne und Töchter; 23 daß sein ganzes Alter ward dreihundertfünfundsechzig Jahre. 24 Und dieweil er ein göttliches Leben führte, nahm ihn Gott hinweg, und er ward nicht mehr gesehen.

25 Methusalah war hundertsiebenundachtzig Jahre alt und zeugte Lamech 26 und lebte darnach siebenhundertzweiundachtzig Jahre und zeugte Söhne und Töchter; 27 daß sein ganzes Alter ward neunhundertneunundsechzig Jahre, und starb.

28 Lamech war hundertzweiundachtzig Jahre alt und zeugte einen Sohn 29 und hieß ihn Noah und sprach: Der wird uns trösten in unsrer Arbeit und Mühe auf dem Acker, den der HERR verflucht hat. 30 Darnach lebte Lamech fünfhundertfünfundneunzig Jahre und zeugte Söhne und Töchter; 31 daß sein ganzes Alter ward siebenhundertsiebenundsiebzig Jahre, und starb. 32 Noah war fünfhundert Jahre alt und zeugte Sem, Ham und Japheth.

Chapter 6
1 Da sich aber die Menschen begannen zu mehren auf Erden und ihnen Töchter geboren wurden, 2 da sahen die Kinder Gottes nach den Töchtern der Menschen, wie sie schön waren, und nahmen zu Weibern, welche sie wollten. 3 Da sprach der HERR: Die Menschen wollen sich von meinem Geist nicht mehr strafen lassen; denn sie sind Fleisch. Ich will ihnen noch Frist geben hundertundzwanzig Jahre. 4 Es waren auch zu den Zeiten Tyrannen auf Erden; denn da die Kinder Gottes zu den Töchtern der Menschen eingingen und sie ihnen Kinder gebaren, wurden daraus Gewaltige in der Welt und berühmte Leute.

5 Da aber der HERR sah, daß der Menschen Bosheit groß war auf Erden und alles Dichten und Trachten ihres Herzens nur böse war immerdar, 6 da reute es ihn, daß er die Menschen gemacht hatte auf Erden, und es bekümmerte ihn in seinem Herzen, 7 und er sprach: Ich will die Menschen, die ich geschaffen habe, vertilgen von der Erde, vom Menschen an bis auf das Vieh und bis auf das Gewürm und bis auf die Vögel unter dem Himmel; denn es reut mich, daß ich sie gemacht habe. 8 Aber Noah fand Gnade vor dem HERRN.

9 Dies ist das Geschlecht Noahs. Noah war ein frommer Mann und ohne Tadel und führte ein göttliches Leben zu seinen Zeiten. 10 Und zeugte drei Söhne: Sem, Ham und Japheth. 11 Aber die Erde war verderbt vor Gottes Augen und voll Frevels. 12 Da sah Gott auf die Erde, und siehe, sie war verderbt; denn alles Fleisch hatte seinen Weg verderbt auf Erden.

13 Da sprach Gott zu Noah: Alles Fleisches Ende ist vor mich gekommen; denn die Erde ist voll Frevels von ihnen; und siehe da, ich will sie verderben mit der Erde. 14 Mache dir einen Kasten von Tannenholz und mache Kammern darin und verpiche ihn mit Pech inwendig und auswendig. 15 Und mache ihn also: Dreihundert Ellen sei die Länge, fünfzig Ellen die Weite und dreißig Ellen die Höhe. 16 Ein Fenster sollst du daran machen obenan, eine Elle groß. Die Tür sollst du mitten in seine Seite setzen. Und er soll drei Boden haben: einen unten, den andern in der Mitte und den dritten in der Höhe.

17 Denn siehe, ich will eine Sintflut mit Wasser kommen lassen auf Erden, zu verderben alles Fleisch, darin ein lebendiger Odem ist, unter dem Himmel. Alles, was auf Erden ist, soll untergehen. 18 Aber mit dir will ich einen Bund aufrichten; und du sollst in den Kasten gehen mit deinen Söhnen, mit deinem Weibe und mit deiner Söhne Weibern. 19 Und du sollst in den Kasten tun allerlei Tiere von allem Fleisch, je ein Paar, Männlein und Weiblein, daß sie lebendig bleiben bei dir. 20 Von den Vögeln nach ihrer Art, von dem Vieh nach seiner Art und von allerlei Gewürm auf Erden nach seiner Art: von den allen soll je ein Paar zu dir hineingehen, daß sie leben bleiben. 21 Und du sollst allerlei Speise zu dir nehmen, die man ißt, und sollst sie bei dir sammeln, daß sie dir und ihnen zur Nahrung da sei. 22 Und Noah tat alles, was ihm Gott gebot.

Chapter 7
1 Und der HERR sprach zu Noah: Gehe in den Kasten, du und dein ganzes Haus; denn dich habe ich gerecht ersehen vor mir zu dieser Zeit. 2 Aus allerlei reinem Vieh nimm zu dir je sieben und sieben, das Männlein und sein Weiblein; von dem unreinen Vieh aber je ein Paar, das Männlein und sein Weiblein. 3 Desgleichen von den Vögeln unter dem Himmel je sieben und sieben, das Männlein und sein Weiblein, auf daß Same lebendig bleibe auf dem ganzen Erdboden. 4 Denn noch über sieben Tage will ich regnen lassen auf Erden vierzig Tage und vierzig Nächte und vertilgen von dem Erdboden alles, was das Wesen hat, das ich gemacht habe.

5 Und Noah tat alles, was ihm der HERR gebot. 6 Er war aber sechshundert Jahre alt, da das Wasser der Sintflut auf Erden kam. 7 Und er ging in den Kasten mit seinen Söhnen, seinem Weibe und seiner Söhne Weibern vor dem Gewässer der Sintflut. 8 Von dem reinen Vieh und von dem unreinen, von den Vögeln und von allem Gewürm auf Erden 9 gingen zu ihm in den Kasten je ein Paar, ein Männlein und ein Weiblein, wie ihm Gott geboten hatte. 10 Und da die sieben Tage vergangen waren, kam das Gewässer der Sintflut auf Erden.

11 In dem sechshundertsten Jahr des Alters Noahs, am siebzehnten Tage des andern Monats, das ist der Tag, da aufbrachen alle Brunnen der großen Tiefe, und taten sich auf die Fenster des Himmels, 12 und kam ein Regen auf Erden vierzig Tage und vierzig Nächte.

13 Eben am selben Tage ging Noah in den Kasten mit Sem, Ham und Japheth, seinen Söhnen, und mit seinem Weibe und seiner Söhne dreien Weibern; 14 dazu allerlei Getier nach seiner Art, allerlei Vieh nach seiner Art, allerlei Gewürm, das auf Erden kriecht, nach seiner Art und allerlei Gevögel nach seiner Art, allerlei Vögel, allerlei Gefieder; 15 das ging alles zu Noah in den Kasten je ein Paar von allem Fleisch, darin ein lebendiger Odem war. 16 Und das waren Männlein und Weiblein von allerlei Fleisch, und gingen hinein, wie denn Gott ihm geboten hatte. Und der HERR schloß hinter ihm zu.

17 Da kam die Sintflut vierzig Tage auf Erden, und die Wasser wuchsen und hoben den Kasten auf und trugen ihn empor über die Erde. 18 Also nahm das Gewässer überhand und wuchs sehr auf Erden, daß der Kasten auf dem Gewässer fuhr. 19 Und das Gewässer nahm überhand und wuchs so sehr auf Erden, daß alle hohen Berge unter dem ganzen Himmel bedeckt wurden. 20 Fünfzehn Ellen hoch ging das Gewässer über die Berge, die bedeckt wurden.

21 Da ging alles Fleisch unter, das auf Erden kriecht, an Vögeln, an Vieh, an Tieren und an allem, was sich regt auf Erden, und alle Menschen. 22 Alles, was einen lebendigen Odem hatte auf dem Trockenen, das starb. 23 Also ward vertilgt alles, was auf dem Erdboden war, vom Menschen an bis auf das Vieh und auf das Gewürm und auf die Vögel unter dem Himmel; das ward alles von der Erde vertilgt. Allein Noah blieb übrig und was mit ihm in dem Kasten war. 24 Und das Gewässer stand auf Erden hundertfünfzig Tage.

Chapter 8
1 Da gedachte Gott an Noah und an alle Tiere und an alles Vieh, das mit ihm in dem Kasten war, und ließ Wind auf Erden kommen, und die Wasser fielen; 2 und die Brunnen der Tiefe wurden verstopft samt den Fenstern des Himmels, und dem Regen vom Himmel ward gewehrt. 3 Und das Gewässer verlief sich von der Erde immer mehr und nahm ab nach hundertfünfzig Tagen.

4 Am siebzehnten Tage des siebenten Monats ließ sich der Kasten nieder auf das Gebirge Ararat. 5 Es nahm aber das Gewässer immer mehr ab bis auf den zehnten Monat. Am ersten Tage des zehnten Monats sahen der Berge Spitzen hervor.

6 Nach vierzig Tagen tat Noah das Fenster auf an dem Kasten, das er gemacht hatte, 7 und ließ einen Raben ausfliegen; der flog immer hin und wieder her, bis das Gewässer vertrocknete auf Erden. 8 Darnach ließ er eine Taube ausfliegen von sich, auf daß er erführe, ob das Gewässer gefallen wäre auf Erden. 9 Da aber die Taube nicht fand, da ihr Fuß ruhen konnte, kam sie wieder zu ihm in den Kasten; denn das Gewässer war noch auf dem ganzen Erdboden. Da tat er die Hand heraus und nahm sie zu sich in den Kasten.

10 Da harrte er noch weitere sieben Tage und ließ abermals eine Taube fliegen aus dem Kasten. 11 Die kam zu ihm zur Abendzeit, und siehe, ein Ölblatt hatte sie abgebrochen und trug's in ihrem Munde. Da merkte Noah, daß das Gewässer gefallen wäre auf Erden. 12 Aber er harrte noch andere sieben Tage und ließ eine Taube ausfliegen; die kam nicht wieder zu ihm.

13 Im sechshundertundersten Jahr des Alters Noahs, am ersten Tage des ersten Monats, vertrocknete das Gewässer auf Erden. Da tat Noah das Dach von dem Kasten und sah, daß der Erdboden trocken war. 14 Und am siebenundzwanzigsten Tage des andern Monats war die Erde ganz trocken.

15 Da redete Gott mit Noah und sprach: 16 Gehe aus dem Kasten, du und dein Weib, deine Söhne und deiner Söhne Weiber mit dir. 17 Allerlei Tiere, die bei dir sind, von allerlei Fleisch, an Vögeln, an Vieh und an allerlei Gewürm, das auf Erden kriecht, das gehe heraus mit dir; und reget euch auf Erden und seid fruchtbar und mehret euch auf Erden.

18 Also ging Noah heraus mit seinen Söhnen und mit seinem Weibe und seiner Söhne Weibern. 19 Dazu allerlei Tiere, allerlei Gewürm, allerlei Vögel und alles, was auf Erden kriecht, das ging aus dem Kasten, ein jegliches mit seinesgleichen.

20 Noah aber baute dem HERRN einen Altar und nahm von allerlei reinem Vieh und von allerlei reinem Gevögel und opferte Brandopfer auf dem Altar. 21 Und der HERR roch den lieblichen Geruch und sprach in seinem Herzen: Ich will hinfort nicht mehr die Erde verfluchen um der Menschen willen; denn das Dichten des menschlichen Herzens ist böse von Jugend auf. Und ich will hinfort nicht mehr schlagen alles, was da lebt, wie ich getan habe. 22 Solange die Erde steht, soll nicht aufhören Saat und Ernte, Frost und Hitze, Sommer und Winter, Tag und Nacht.

Chapter 9
1 Und Gott segnete Noah und seine Söhne und sprach: Seid fruchtbar und mehrt euch und erfüllt die Erde. 2 Eure Furcht und Schrecken sei über alle Tiere auf Erden und über alle Vögel unter dem Himmel, über alles, was auf dem Erdboden kriecht, und über alle Fische im Meer; in eure Hände seien sie gegeben. 3 Alles, was sich regt und lebt, das sei eure Speise; wie das grüne Kraut habe ich's euch alles gegeben. 4 Allein esset das Fleisch nicht, das noch lebt in seinem Blut. 5 Auch will ich eures Leibes Blut rächen und will's an allen Tieren rächen und will des Menschen Leben rächen an einem jeglichen Menschen als dem, der sein Bruder ist.

6 Wer Menschenblut vergießt, des Blut soll auch durch Menschen vergossen werden; denn Gott hat den Menschen zu seinem Bilde gemacht. 7 Seid fruchtbar und mehrt euch und reget euch auf Erden, daß euer viel darauf werden.

8 Und Gott sagte zu Noah und seinen Söhnen mit ihm: 9 Siehe, ich richte mit euch einen Bund auf und mit eurem Samen nach euch 10 und mit allem lebendigen Tier bei euch, an Vögeln, an Vieh und an allen Tieren auf Erden bei euch, von allem, was aus dem Kasten gegangen ist, was für Tiere es sind auf Erden. 11 Und richte meinen Bund also mit euch auf, daß hinfort nicht mehr alles Fleisch verderbt werden soll mit dem Wasser der Sintflut, und soll hinfort keine Sintflut mehr kommen, die die Erde verderbe.

12 Und Gott sprach: Das ist das Zeichen des Bundes, den ich gemacht habe zwischen mir und euch und allen lebendigen Tieren bei euch hinfort ewiglich: 13 Meinen Bogen habe ich gesetzt in die Wolken; der soll das Zeichen sein des Bundes zwischen mir und der Erde. 14 Und wenn es kommt, daß ich Wolken über die Erde führe, so soll man meinen Bogen sehen in den Wolken. 15 Alsdann will ich gedenken an meinen Bund zwischen mir und euch und allen lebendigen Tieren in allerlei Fleisch, daß nicht mehr hinfort eine Sintflut komme, die alles Fleisch verderbe. 16 Darum soll mein Bogen in den Wolken sein, daß ich ihn ansehe und gedenke an den ewigen Bund zwischen Gott und allen lebendigen Tieren in allem Fleisch, das auf Erden ist. 17 Und Gott sagte zu Noah: Das sei das Zeichen des Bundes, den ich aufgerichtet habe zwischen mir und allem Fleisch auf Erden.

18 Die Söhne Noahs, die aus dem Kasten gingen, sind diese: Sem, Ham und Japheth. Ham aber ist der Vater Kanaans. 19 Das sind die drei Söhne Noahs, von denen ist alles Land besetzt.

20 Noah aber fing an und ward ein Ackermann und pflanzte Weinberge. 21 Und da er von dem Wein trank, ward er trunken und lag in der Hütte aufgedeckt. 22 Da nun Ham, Kanaans Vater, sah seines Vaters Blöße, sagte er's seinen beiden Brüdern draußen. 23 Da nahmen Sem und Japheth ein Kleid und legten es auf ihrer beider Schultern und gingen rücklings hinzu und deckten ihres Vaters Blöße zu; und ihr Angesicht war abgewandt, daß sie ihres Vaters Blöße nicht sahen.

24 Als nun Noah erwachte von seinem Wein und erfuhr, was ihm sein jüngster Sohn getan hatte, 25 sprach er: Verflucht sei Kanaan und sei ein Knecht aller Knechte unter seinen Brüdern! 26 Und sprach weiter: Gelobt sei der HERR, der Gott Sems; und Kanaan sei sein Knecht! 27 Gott breite Japheth aus und lasse ihn wohnen in den Hütten Sems; und Kanaan sei sein Knecht!

28 Noah aber lebte nach der Sintflut dreihundertfünfzig Jahre, 29 daß sein ganzes Alter ward neunhundertfünfzig Jahre, und starb.

Chapter 10
1 Dies ist das Geschlecht der Kinder Noahs: Sem, Ham, Japheth. Und es wurden ihnen Kinder geboren nach der Sintflut.

2 Die Kinder Japheths sind diese: Gomer, Magog, Madai, Javan, Thubal, Mesech und Thiras. 3 Aber die Kinder Gomers sind diese: Askenas, Riphath und Thogarma. 4 Die Kinder Javans sind diese: Elisa, Tharsis, Kittim und Dodanim. 5 Von diesen sind ausgebreitet die Inseln der Heiden in ihren Ländern, jegliche nach ihrer Sprache, Geschlecht und Leuten.

6 Die Kinder Hams sind diese: Chus, Mizraim, Put und Kanaan. 7 Aber die Kinder des Chus sind diese: Seba, Hevila, Sabtha, Raema und Sabtecha. Aber die Kinder Raemas sind diese: Scheba und Dedan.

8 Chus aber zeugte den Nimrod. Der fing an, ein gewaltiger Herr zu sein auf Erden, 9 und war ein gewaltiger Jäger vor dem HERRN. Daher spricht man: Das ist ein gewaltiger Jäger vor dem HERRN wie Nimrod. 10 Und der Anfang seines Reichs war Babel, Erech, Akkad und Kalne im Lande Sinear. 11 Von dem Land ist darnach gekommen der Assyrer und baute Ninive und Rehoboth-Ir und Kalah, 12 dazu Resen zwischen Ninive und Kalah. Dies ist die große Stadt.

13 Mizraim zeugte Ludim, Anamim, Lehabim, Naphtuhim, 14 Pathrusim und Kasluhim. Von dannen sind gekommen die Philister und die Kaphthoriter.

15 Kanaan aber zeugte Zidon, seinen ersten Sohn, und Heth, 16 den Jebusiter, den Amoriter, den Girgasiter, 17 den Heviter, den Arkiter, den Siniter, 18 den Arvaditer, den Zemariter und den Hamathiter. Daher sind ausgebreitet die Geschlechter der Kanaaniter.

19 Und ihre Grenzen waren von Zidon an, durch Gerar bis gen Gaza, bis man kommt gen Sodom, Gomorra, Adama, Zeboim und bis gen Lasa.

20 Das sind die Kinder Hams in ihren Geschlechtern, Sprachen, Ländern und Leuten.

21 Sem aber, Japheths, des größten, Bruder, zeugte auch Kinder, der ein Vater ist aller Kinder von Eber.

22 Und dies sind Sems Kinder: Elam, Assur, Arphachsad, Lud und Aram.

23 Die Kinder aber Arams sind diese: Uz, Hul, Gether und Mas.

24 Arphachsad aber zeugte Salah, Salah zeugte Eber.

25 Eber zeugte zwei Söhne. Einer hieß Peleg, darum daß zu seiner Zeit die Welt zerteilt ward; des Bruder hieß Joktan.

26 Und Joktan zeugte Almodad, Saleph, Hazarmaveth, Jarah, 27 Hadoram, Usal, Dikla, 28 Obal, Abimael, Scheba, 29 Ophir, Hevila und Jobab. Das sind alle Kinder Joktans. 30 Und ihre Wohnung war von Mesa an, bis man kommt gen Sephar, an den Berg gegen Morgen.

31 Das sind die Kinder Sems in ihren Geschlechtern, Sprachen, Ländern und Leuten.

32 Das sind nun die Nachkommen der Kinder Noahs in ihren Geschlechtern und Leuten. Von denen sind ausgebreitet die Leute auf Erden nach der Sintflut.`

const MARK_2_SPANISH = `Chapter 2
1 Entró Jesús otra vez en Capernaum después de algunos días; y se oyó que estaba en casa. 2 E inmediatamente se juntaron muchos, de manera que ya no cabían ni aun a la puerta; y les predicaba la palabra. 3 Entonces vinieron a él unos trayendo un paralítico, que era cargado por cuatro. 4 Y como no podían acercarse a él a causa de la multitud, descubrieron el techo de donde estaba, y haciendo una abertura, bajaron el lecho en que yacía el paralítico. 5 Al ver Jesús la fe de ellos, dijo al paralítico: Hijo, tus pecados te son perdonados. 6 Estaban allí sentados algunos de los escribas, los cuales cavilaban en sus corazones: 7 ¿Por qué habla este así? Blasfemias dice. ¿Quién puede perdonar pecados, sino solo Dios? 8 Y conociendo luego Jesús en su espíritu que cavilaban de esta manera dentro de sí mismos, les dijo: ¿Por qué caviláis así en vuestros corazones? 9 ¿Qué es más fácil, decir al paralítico: Tus pecados te son perdonados, o decirle: Levántate, toma tu lecho y anda? 10 Pues para que sepáis que el Hijo del Hombre tiene potestad en la tierra para perdonar pecados (dijo al paralítico): 11 A ti te digo: Levántate, toma tu lecho, y vete a tu casa. 12 Entonces él se levantó en seguida, y tomando su lecho, salió delante de todos, de manera que todos se asombraron, y glorificaron a Dios, diciendo: Nunca hemos visto tal cosa.

13 Después volvió a salir al mar; y toda la gente venía a él, y les enseñaba. 14 Y al pasar, vio a Leví hijo de Alfeo, sentado al banco de los tributos públicos, y le dijo: Sígueme. Y levantándose, le siguió. 15 Aconteció que estando Jesús a la mesa en casa de él, muchos publicanos y pecadores estaban también a la mesa juntamente con Jesús y sus discípulos; porque había muchos que le habían seguido. 16 Y los escribas y los fariseos, viéndole comer con los publicanos y con los pecadores, dijeron a los discípulos: ¿Qué es esto, que él come y bebe con los publicanos y pecadores? 17 Al oír esto Jesús, les dijo: Los sanos no tienen necesidad de médico, sino los enfermos. No he venido a llamar a justos, sino a pecadores.

18 Y los discípulos de Juan y los de los fariseos ayunaban; y vinieron, y le dijeron: ¿Por qué los discípulos de Juan y los de los fariseos ayunan, y tus discípulos no ayunan? 19 Jesús les dijo: ¿Acaso pueden los que están de bodas ayunar mientras está con ellos el esposo? Entre tanto que tienen consigo al esposo, no pueden ayunar. 20 Pero vendrán días cuando el esposo les será quitado, y entonces en aquellos días ayunarán. 21 Nadie pone remiendo de paño nuevo en vestido viejo; de otra manera, el mismo remiendo nuevo tira de lo viejo, y se hace peor la rotura. 22 Y nadie echa vino nuevo en odres viejos; de otra manera, el vino nuevo rompe los odres, y el vino se derrama, y los odres se pierden; pero el vino nuevo en odres nuevos se ha de echar.

23 Aconteció que al pasar él por los sembrados un día de reposo, sus discípulos, andando, comenzaron a arrancar espigas. 24 Entonces los fariseos le dijeron: Mira, ¿por qué hacen en el día de reposo lo que no es lícito? 25 Pero él les dijo: ¿Nunca leísteis lo que hizo David cuando tuvo necesidad, y sintió hambre, él y los que con él estaban; 26 cómo entró en la casa de Dios, siendo Abiatar sumo sacerdote, y comió los panes de la proposición, de los cuales no es lícito comer sino a los sacerdotes, y aun dio a los que con él estaban? 27 También les dijo: El día de reposo fue hecho por causa del hombre, y no el hombre por causa del día de reposo. 28 Por tanto, el Hijo del Hombre es Señor aun del día de reposo.`

const ARQUITECTA_SPANISH = `Chapter 1
1 Soy arquitecta. Los arquitectos diseñan y construyen edificios porque les gustan los edificios y las casas al igual que yo. Por eso Ma me llama su "pequeña arquitecta".

2 Para construir una casa, necesita espacio en algún lugar.

3 Su casa podría estar en un bosque lleno de árboles, un lugar caliente del desierto, un lugar en lo alto de las montañas.

4 Un lugar donde hay blanco nieve alrededor ¡brrr!… Un lugar lluvioso ¡plic!…¡ploc!, en un pueblo verde fangoso o un lugar altísimo como los rascacielos.`

export default function TextInput({ onTranslate, isLoading }: TextInputProps) {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onTranslate(text)
    }
  }

  const loadSample = () => {
    setText(SAMPLE_TEXT)
  }

  const loadMultiChapterSample = () => {
    setText(MULTI_CHAPTER_SAMPLE)
  }

  const loadGenesis1to10 = () => {
    setText(GENESIS_1_10)
  }

  const loadMark2Spanish = () => {
    setText(MARK_2_SPANISH)
  }

  const loadArquitecta = () => {
    setText(ARQUITECTA_SPANISH)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">German Source Text</h2>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={loadSample}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Load Genesis 1:1-8
          </button>
          <button
            type="button"
            onClick={loadMultiChapterSample}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Load Multi-Chapter Sample
          </button>
          <button
            type="button"
            onClick={loadGenesis1to10}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            Load Genesis 1-10
          </button>
          <button
            type="button"
            onClick={loadMark2Spanish}
            className="text-sm text-orange-600 hover:text-orange-800"
          >
            Load Mark 2 (ES)
          </button>
          <button
            type="button"
            onClick={loadArquitecta}
            className="text-sm text-pink-600 hover:text-pink-800"
          >
            Load Arquitecta (ES)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste German biblical text here...&#10;&#10;Example: 1 Am Anfang schuf Gott Himmel und Erde..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-serif"
          disabled={isLoading}
        />

        <div className="mt-4 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setText('')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            disabled={isLoading || !text}
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={isLoading || !text.trim()}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <span className="loading-spinner" />}
            {isLoading ? 'Translating...' : 'Translate'}
          </button>
        </div>
      </form>
    </div>
  )
}
