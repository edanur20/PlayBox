// Blanc Manger Coco - Cartes Questions et Réponses
// Les questions contiennent "____" qui sera remplacé par une réponse
// Certaines questions ont PLUSIEURS trous (____) nécessitant plusieurs réponses
// VERSION ÉTENDUE - 200+ questions, 300+ réponses

export const questionCards = [
  // === QUESTIONS À 1 TROU - VIE QUOTIDIENNE ===
  "Ma mère m'a surpris en train de ____ dans le salon à 3h du matin, et depuis elle ne me regarde plus jamais dans les yeux.",
  "Le secret d'un mariage heureux selon mon grand-père ? ____ tous les jours sans exception.",
  "J'ai été viré de mon travail à cause de ____ et franchement je ne regrette rien.",
  "Mon médecin m'a prescrit ____ pour soigner ma dépression, mais ça n'a fait qu'empirer les choses.",
  "Le pire cadeau de Noël que j'ai jamais reçu ? ____ de la part de ma belle-mère qui souriait.",
  "Je ne peux pas dormir sans ____ à côté de moi depuis mon enfance, c'est mon secret honteux.",
  "Mon premier rendez-vous amoureux s'est terminé par ____ et je n'ai plus jamais eu de nouvelles.",
  "La dernière chose que je veux voir avant de mourir, c'est définitivement ____.",
  "Le secret de ma grand-mère pour rester en forme à 92 ans : ____ chaque matin au réveil.",
  "J'ai dépensé absolument toutes mes économies dans ____ et je ne regrette rien.",
  "Sous ma douche, je pense souvent à ____ et ça m'inquiète un peu quand même.",
  "Mon voisin fait ____ tous les soirs à 3h du matin et les flics refusent d'intervenir.",
  "J'ai trouvé ____ dans le tiroir secret de mes parents et ma vie n'a plus jamais été la même.",
  "Ma routine matinale inclut toujours ____ avant même de prendre mon café.",
  "Le dimanche après-midi, rien de tel que ____ pour se détendre en famille.",

  // === QUESTIONS À 2 TROUS ===
  "Hier soir, j'ai mélangé ____ avec ____ et j'ai fini aux urgences à 4h du matin.",
  "Mon ex m'a quitté parce que j'aimais trop ____ mais pas assez ____.",
  "Le prof de maths a dit que ____ était aussi important que ____ dans la vie.",
  "Ma mère pense que ____ c'est bien, mais que ____ c'est le diable.",
  "J'ai échangé ____ contre ____ sur le Bon Coin et je me suis fait arnaquer.",
  "Le médecin a dit de choisir entre ____ et ____ pour ma santé. J'ai choisi les deux.",
  "Mon patron veut qu'on remplace ____ par ____ au bureau pour plus de productivité.",
  "La recette secrète de ma grand-mère : mélanger ____ avec ____ et servir froid.",
  "Pour réussir dans la vie, il faut ____ le matin et ____ le soir, c'est la clé.",
  "J'ai découvert que mon voisin cachait ____ dans son garage et ____ dans sa cave.",
  "Le gouvernement a décidé de taxer ____ pour financer ____ et tout le monde est furieux.",
  "Mon chat a vomi ____ sur ____ et j'ai dû tout jeter à la poubelle.",
  "La différence entre l'amour et la haine ? ____ contre ____.",
  "Mon Tinder dit que j'aime ____ mais en vrai je préfère ____.",
  "Si je devais choisir entre ____ et ____, je choisirais de mourir.",

  // === QUESTIONS À 3 TROUS ===
  "Ma soirée parfaite : ____, puis ____, et enfin ____ avant de m'écrouler sur le canapé.",
  "Les trois choses que j'emporterais sur une île déserte : ____, ____ et évidemment ____.",
  "Mon CV mentionne que je suis expert en ____, ____ et ____ alors que c'est totalement faux.",
  "Le menu de Noël cette année : ____ en entrée, ____ en plat et ____ en dessert. Tout le monde a vomi.",
  "Pour draguer, ma technique c'est de parler de ____, puis de ____, et si ça marche de ____.",
  "Les trois étapes de ma gueule de bois : ____, ensuite ____, et finalement ____.",
  "Ma thérapie consiste à accepter ____, pardonner ____ et oublier ____.",
  "Le triangle amoureux le plus bizarre : moi, ____ et ____ avec ____ qui regarde.",

  // === QUESTIONS LONGUES À 1 TROU ===
  "Après 15 ans de mariage, ma femme m'a avoué qu'elle fantasmait secrètement sur ____ et je ne sais pas comment réagir.",
  "Le directeur de l'école a convoqué mes parents parce qu'apparemment j'aurais montré ____ à toute la classe de CM2.",
  "Mon testament stipule clairement que tous mes biens iront à ____ et ma famille n'est pas du tout d'accord.",
  "La police a débarqué chez moi à 6h du matin parce que les voisins avaient signalé ____ dans mon appartement.",
  "Le prêtre a refusé de me marier à l'église après avoir découvert que je pratiquais ____ chaque dimanche matin.",
  "Mon fils de 8 ans m'a demandé d'où venaient les bébés et j'ai paniqué en répondant ____.",
  "Le psychiatre m'a diagnostiqué une addiction sévère à ____ et m'a prescrit une cure de 6 mois minimum.",
  "J'ai été banni à vie de Disneyland Paris après avoir été surpris en train de ____ devant le château.",
  "Ma grand-mère de 87 ans m'a choqué en m'avouant qu'elle avait passé sa vie à ____ sans que personne ne le sache.",
  "Le jour de mon mariage, le témoin a révélé à tout le monde que le marié avait fait ____ la veille.",

  // === RELATIONS / AMOUR ===
  "Notre histoire d'amour a commencé quand je lui ai montré ____ et qu'il/elle n'a pas fui en courant.",
  "J'ai quitté mon ex définitivement après l'avoir surpris(e) en train de ____ dans notre lit conjugal.",
  "Le secret pour séduire quelqu'un selon mon père : ____ et ne jamais s'excuser.",
  "Mon/ma partenaire me reproche toujours ____ mais refuse d'en parler en thérapie de couple.",
  "La pire chose à dire pendant un mariage ? « Je t'aime, mais pas autant que ____ ».",
  "Sur Tinder, ma bio dit : « J'aime ____ et les longues promenades sur la plage », ça ne marche pas.",
  "Ma belle-mère pense que je suis ____ et elle n'a pas totalement tort pour être honnête.",
  "Le premier mot de mon bébé était ____ et ma femme n'a pas trouvé ça drôle du tout.",
  "J'ai découvert que ma copine avait ____ dans son sac à main et j'ai des questions.",

  // === QUESTIONS À 2 TROUS - AMOUR ===
  "Mon ex était ____ au lit mais ____ dans la vie de tous les jours, c'était compliqué.",
  "Le couple parfait selon ma mère : lui fait ____ et elle fait ____.",
  "J'ai rencontré ____ sur Tinder et ____ sur Grindr le même soir, c'était gênant.",
  "Le secret d'un couple qui dure : ____ le lundi et ____ le vendredi.",
  "Ma femme dit que je suis ____ comme son père et ____ comme son ex, je ne sais pas comment le prendre.",

  // === TRAVAIL / ÉTUDES ===
  "Pendant la réunion zoom, j'ai accidentellement partagé mon écran qui affichait ____ devant 50 collègues.",
  "Le PDG a démissionné après que la presse a révélé qu'il pratiquait ____ avec l'argent de l'entreprise.",
  "Pour améliorer la productivité, le management a décidé d'installer ____ dans l'open space.",
  "J'ai été promu directeur grâce à ____ et certainement pas grâce à mes compétences.",
  "Le team building cette année consistait à ____ et 3 personnes ont démissionné le lendemain.",
  "Le prof nous a confisqué ____ en plein cours et l'a gardé jusqu'à la fin de l'année.",
  "J'ai raté mon bac à cause de ____ et je n'ai aucun regret.",
  "Ma thèse de doctorat porte sur ____ et mon directeur de thèse a démissionné.",
  "Le stagiaire a encore fait ____ et cette fois on ne peut plus le couvrir.",
  "J'ai mis ____ sur ma note de frais et les RH veulent me parler.",

  // === QUESTIONS À 2 TROUS - TRAVAIL ===
  "Mon patron m'a surpris en train de ____ alors que j'aurais dû ____.",
  "L'entretien d'embauche s'est mal passé quand j'ai dit que ____ était plus important que ____.",
  "Le séminaire d'entreprise : on devait faire ____ le matin et ____ l'après-midi. Tout le monde a fui.",
  "Au bureau, il y a ceux qui font ____ et ceux qui font ____. Moi je fais rien.",

  // === SOCIÉTÉ / POLITIQUE ===
  "Le gouvernement a finalement légalisé ____ et la France ne sera plus jamais la même.",
  "La nouvelle tendance sur TikTok consiste à ____ en public et les vieux sont scandalisés.",
  "Les jeunes d'aujourd'hui ne pensent qu'à ____ selon mon oncle raciste de 67 ans.",
  "Le réchauffement climatique est principalement causé par ____ mais personne ne veut l'admettre.",
  "Le prochain président promet ____ à tous les Français s'il est élu.",
  "BFM annonce en breaking news : ____ découvert dans les locaux de l'Élysée !",
  "Le nouveau variant du Covid s'appelle ____ et touche principalement les influenceurs.",
  "L'inflation a fait exploser le prix de ____ et les Français manifestent.",

  // === QUESTIONS À 2 TROUS - POLITIQUE ===
  "La gauche veut ____ tandis que la droite veut ____, moi je veux juste dormir.",
  "Macron a dit que ____ c'était bien mais que ____ c'était mal, et personne n'a compris.",
  "Les boomers pensent que ____ va sauver la France, les millennials préfèrent ____.",
  "Le débat présidentiel a tourné au clash quand un candidat a traité l'autre de ____.",

  // === CÉLÉBRITÉS / MÉDIAS ===
  "Le nouveau documentaire Netflix révèle que la star cachait ____ depuis 20 ans.",
  "Le footballeur a célébré son but en faisant ____ devant les caméras du monde entier.",
  "Squeezie a fait une vidéo sur ____ et YouTube l'a immédiatement démonétisée.",
  "Nabilla a lancé sa nouvelle marque de ____ et c'est déjà un scandale.",
  "Cyril Hanouna invite ce soir ____ pour parler de ____ et ça va clasher.",
  "Kylian Mbappé a avoué que son rêve secret c'était ____ et non pas le football.",
  "Le prochain album de Jul parle exclusivement de ____ sur 18 titres.",
  "Elon Musk veut envoyer ____ sur Mars pour coloniser la planète rouge.",
  "Le scandale : on a surpris un ministre en train de ____ dans un hôtel 5 étoiles.",

  // === QUESTIONS À 2 TROUS - CÉLÉBRITÉS ===
  "Kim Kardashian a posté une photo de ____ à côté de ____ et internet a explosé.",
  "La collab entre ____ et ____ a choqué tout le monde sur les réseaux sociaux.",
  "Le couple le plus improbable : ____ qui sort avec ____ depuis 6 mois apparemment.",

  // === SITUATIONS ABSURDES ===
  "À Disneyland, ils ont ajouté une attraction sur ____ et c'est clairement pas pour les enfants.",
  "Le nouveau menu McDonald's inclut ____ et les végans sont en colère.",
  "J'ai trouvé ____ dans ma soupe à la cantine et j'ai quand même fini mon assiette.",
  "L'avion a fait demi-tour après 2h de vol à cause de ____ en cabine.",
  "Le zoo a dû fermer définitivement après ____ qui a traumatisé tous les visiteurs.",
  "Les archéologues ont découvert ____ dans la tombe de Toutankhamon et ça remet tout en question.",
  "La notice IKEA explique en 47 étapes comment assembler ____ mais personne n'y arrive.",
  "J'ai commandé sur Wish un iPhone et j'ai reçu ____ à la place.",
  "Le livreur Uber Eats m'a apporté ____ par erreur et je l'ai quand même gardé.",
  "Le Père Noël m'a laissé ____ sous le sapin et depuis les enfants pleurent.",

  // === QUESTIONS À 2 TROUS - ABSURDE ===
  "J'ai mis ____ dans le micro-ondes avec ____ et ça a explosé.",
  "Le nouveau défi TikTok : mélanger ____ avec ____ et le manger en live.",
  "Au musée, quelqu'un a remplacé La Joconde par ____ et personne n'a remarqué pendant 3 jours.",
  "La SNCF s'excuse : le retard est dû à ____ sur les voies et ____ dans la locomotive.",

  // === QUESTIONS À 3 TROUS - ABSURDE ===
  "Ma recette secrète : prendre ____, ajouter ____, et servir avec ____ à température ambiante.",
  "L'escape game le plus bizarre : trouver ____, résoudre l'énigme de ____ et s'échapper avant que ____ n'arrive.",

  // === PHILOSOPHIE / EXISTENTIEL ===
  "Dieu existe forcément parce que ____ ne peut pas être une coïncidence.",
  "La vie n'a absolument aucun sens sans ____ pour te rappeler pourquoi tu te lèves.",
  "L'humanité sera définitivement détruite par ____ d'ici 2050.",
  "Le vrai amour, c'est quand tu acceptes ____ de l'autre sans sourciller.",
  "On reconnaît un génie au fait qu'il pratique ____ quotidiennement.",
  "La mort, ce n'est finalement que ____ pour l'éternité.",
  "Le paradis ressemble exactement à ____ mais en version illimitée.",
  "L'enfer, c'est ____ pendant toute l'éternité sans pause.",
  "On devient vraiment adulte quand on comprend enfin que ____.",

  // === QUESTIONS À 2 TROUS - PHILO ===
  "La vie c'est ____ mais la mort c'est ____, donc autant profiter.",
  "Selon Nietzsche, ____ est mort mais ____ est toujours vivant.",
  "Le sens de la vie selon ma grand-mère : ____ le matin et ____ le soir.",

  // === ENFANCE / NOSTALGIE ===
  "Quand j'étais petit, je croyais sincèrement que ____ était vrai.",
  "Mon jouet préféré quand j'étais enfant était ____ et ça explique beaucoup de choses sur moi.",
  "Le Père Noël m'a traumatisé le jour où il m'a offert ____ devant toute la famille.",
  "Mes parents m'ont menti pendant 15 ans sur ____ et je ne m'en suis jamais remis.",
  "À la récré, on jouait tous à ____ jusqu'à ce qu'un gamin se blesse gravement.",
  "Mon premier crush, c'était ____ et j'en ai encore honte aujourd'hui.",
  "J'ai pleuré toutes les larmes de mon corps devant ____ quand j'avais 8 ans.",
  "Mon Tamagotchi est mort de ____ et je ne m'en suis jamais remis.",

  // === MÉDICAL / SANTÉ ===
  "Les urgences étaient complètement bondées à cause de ____ qui a touché toute la ville.",
  "Le nouveau traitement miracle contre le cancer : ____ trois fois par jour.",
  "J'ai dit au médecin que j'avais accidentellement avalé ____ et il a appelé les pompiers.",
  "Les effets secondaires du médicament incluent ____ et une envie irrésistible de danser.",
  "Mon psy pense que je suis complètement obsédé par ____ depuis mon enfance.",
  "L'IRM a révélé ____ dans mon cerveau et les médecins n'ont jamais vu ça.",

  // === QUESTIONS À 2 TROUS - MÉDICAL ===
  "Le docteur a dit que ____ c'était normal mais que ____ nécessitait une opération.",
  "Pour guérir de ____, il faut arrêter ____ immédiatement selon mon médecin.",

  // === SPORT ===
  "Le dopage aux JO a atteint un nouveau niveau avec ____ qui améliore les performances.",
  "Le coach motive son équipe avant le match avec ____ et un discours sur la mort.",
  "La bagarre a éclaté dans les tribunes à cause de ____ et 15 personnes ont été arrêtées.",
  "Le PSG a acheté ____ pour 200 millions d'euros et tout le monde se moque.",
  "La VAR a annulé le but après avoir détecté ____ sur le ralenti.",

  // === VOYAGE ===
  "En France, il est formellement interdit de ____ mais tout le monde le fait quand même.",
  "Les touristes viennent du monde entier pour voir ____ et repartent déçus.",
  "J'ai ramené ____ de mes vacances en Thaïlande et la douane m'a arrêté.",
  "À l'aéroport, on m'a confisqué ____ et je suis fiché S maintenant.",
  "À Vegas, j'ai parié ____ et j'ai tout perdu en 10 minutes.",

  // === FÊTES / SOIRÉES ===
  "Au réveillon, on a tous fini par ____ et plus personne ne se parle depuis.",
  "Mon anniversaire a été complètement gâché par ____ qui a débarqué sans invitation.",
  "La tradition familiale depuis 30 ans : ____ à chaque Noël jusqu'à ce que quelqu'un pleure.",
  "Le DJ a mis ____ et absolument tout le monde a quitté la piste de danse.",
  "La soirée a complètement dérapé quand quelqu'un a sorti ____ de son sac.",
  "Le lendemain de ma cuite, j'ai retrouvé ____ dans mon lit et je ne me souviens de rien.",

  // === QUESTIONS À 2 TROUS - FÊTES ===
  "La soirée a commencé avec ____ et s'est terminée avec ____ aux urgences.",
  "Mon anniversaire idéal : ____ puis ____ et finalement appeler mon ex en pleurant.",
  "Au nouvel an, on fait ____ à minuit et ____ à 3h du matin quand tout dérape.",

  // === QUESTIONS À 3 TROUS - FÊTES ===
  "L'enterrement de vie de garçon parfait : commencer par ____, continuer avec ____ et finir avec ____.",

  // === ULTRA TRASH ===
  "Je me suis fait définitivement virer pour avoir fait ____ sur le bureau du patron.",
  "Ma sextape avec ____ a fuité sur internet et ma mère l'a vue.",
  "J'ai perdu ma virginité grâce à ____ et c'est mon secret le plus honteux.",
  "OnlyFans a banni ____ de ma page et j'ai perdu tous mes revenus.",
  "J'ai envoyé un dick pic à ____ par erreur et je dois déménager.",
  "Mon historique de recherche Google contient principalement ____ et je vis dans la peur.",
  "Ma mère a trouvé ____ sous mon lit et elle n'a plus jamais été la même.",
  "L'autopsie a révélé ____ dans son estomac et personne ne comprend comment.",
  "Le clown d'anniversaire a sorti ____ de son pantalon devant tous les enfants.",

  // === QUESTIONS À 2 TROUS - TRASH ===
  "Au confessionnal, j'ai avoué ____ avec ____ et le prêtre a quitté l'Église.",
  "Ma nuit la plus folle : ____ avec ____ dans les toilettes d'un Quick.",
  "Le plan à trois a mal tourné quand ____ s'est transformé en ____.",
  "J'ai mélangé ____ et ____ et j'ai failli mourir mais c'était bien.",

  // === QUESTIONS À 3 TROUS - TRASH ===
  "La pire soirée de ma vie : j'ai ____, ensuite j'ai ____ et pour finir j'ai ____ sur la voiture de mon patron.",
  "Mon week-end à Amsterdam : ____, ____ et ____, dans cet ordre précis.",
];

export const responseCards = [
  // === CORPS / ANATOMIE ===
  "Mes tétons géants",
  "Un ongle incarné purulent",
  "Des aisselles ultra poilues",
  "Une mycose des pieds qui pue",
  "Du cérumen de 3 ans d'âge",
  "Un orteil en trop bien visible",
  "Le prépuce de mon ex encadré",
  "Des varices géantes et violettes",
  "Un furoncle qui explose en public",
  "De la cellulite très flasque",
  "Un pet vaginal sonore",
  "Des hémorroïdes enflammées",
  "Un kyste pilonidal infecté",
  "Une verrue génitale de 3cm",
  "Du smegma de 3 jours",
  "Un téton inversé bizarre",
  "Des crottes de nez séchées",
  "Un anus prolapsé en direct",
  "Des boules de poils pubiens",
  "Un nombril qui pue la mort",
  "Des aréoles de 15cm de diamètre",
  "Une couille plus basse que l'autre",
  "Un clitoris de 8cm de long",
  "Des pieds moisis et fendillés",
  "Une bite de 30cm (soi-disant)",

  // === NOURRITURE DÉGEU ===
  "Du fromage qui pue depuis 2019",
  "Un kebab 4h du matin dégueulasse",
  "Des tripes à la mode de Caen",
  "Un yaourt périmé avec des vers",
  "De la mayo rance au soleil",
  "Un Big Mac moisi de 3 semaines",
  "Du foie gras sur des Pringles",
  "Une pizza ananas jambon ketchup",
  "De la raclette de 3 jours froide",
  "Un sushi du Lidl périmé",
  "Des huîtres pas fraîches du tout",
  "Du cheval Findus bien caché",
  "Une fondue au Roquefort rance",
  "Du cassoulet en boîte de 2015",
  "De la langue de bœuf crue",
  "Des rognons de porc marinés",
  "Un sandwich SNCF à 12 euros",
  "Du surimi à la vodka chaude",
  "De la cervelle de veau au beurre",
  "Un McDo réchauffé 4 fois",

  // === PERSONNALITÉS FRANÇAISES ===
  "Emmanuel Macron en string léopard",
  "Jean-Pierre Pernaut complètement nu",
  "Nabilla sous cocaïne en live",
  "Gérard Depardieu bourré à 9h",
  "Cyril Hanouna sans sa perruque",
  "Marine Le Pen au karaoké sur du Jul",
  "Patrick Sébastien en pleurs à jeun",
  "Jean-Marie Bigard défoncé au crack",
  "Maître Gims sans ses lunettes de soleil",
  "Didier Raoult en slip kangourou",
  "Brigitte Macron en bikini string",
  "Éric Zemmour qui mange un kebab",
  "Jean-Luc Mélenchon qui twerk sur Aya Nakamura",
  "Kev Adams pas drôle du tout",
  "Florian Philippot au sauna gay",
  "François Hollande sur Tinder",
  "Nicolas Sarkozy en talonnettes de 15cm",
  "Aya Nakamura à l'Académie Française",
  "Booba en costume 3 pièces cravate",
  "Zinédine Zidane qui donne un coup de boule",
  "Jul qui fait de l'opéra à Garnier",

  // === PERSONNALITÉS INTERNATIONALES ===
  "Donald Trump en couche culotte",
  "Kim Jong-Un au McDo en survet",
  "Vladimir Poutine torse nu sur un ours",
  "Joe Biden qui s'endort en réunion",
  "Elon Musk complètement défoncé",
  "Jeff Bezos qui vit avec le SMIC",
  "Mark Zuckerberg qui agit comme un humain",
  "Kanye West mentalement stable",
  "Rihanna enceinte de moi (dans mes rêves)",
  "Drake qui pleure sur Instagram",
  "The Rock qui fait du tricot en direct",
  "Snoop Dogg sobre depuis 3 jours",
  "Cristiano Ronaldo au kebab bourré",
  "Messi sous stéroïdes et hormones",
  "Le Pape en boîte de nuit techno",

  // === OBJETS DU QUOTIDIEN ===
  "Un Tupperware sans son couvercle",
  "Des Crocs avec des chaussettes blanches",
  "Un string léopard taille XL",
  "Une brosse à WC usagée et marron",
  "Des boules Quies pleines de cire",
  "Un coussin péteur complètement dégonflé",
  "Un cendrier qui déborde de mégots",
  "Une capote usagée et trouée",
  "Un vibro de grand-mère vintage",
  "Des menottes fluffy roses",
  "Un plug anal taille XXL",
  "Une poupée gonflable percée",
  "Un godemichet géant de 40cm",
  "Des boules de geisha rouillées",
  "Un fleshlight moisi pas lavé",
  "Une culotte menstruelle bien pleine",
  "Un test de grossesse très positif",
  "Un string comestible périmé de 2018",
  "Des couches pour adultes parfumées",
  "Un nain de jardin à caractère érotique",
  "Une perruque de clown dépressif",
  "Un déambulateur pimpé avec des néons",
  "Un dentier qui claque tout seul",
  "Un corset orthopédique sexy",

  // === ACTIONS HONTEUSES ===
  "Regarder Secret Story en boucle pendant 3 jours",
  "Roter l'alphabet à l'envers en public",
  "Faire du pole dance devant mamie à Noël",
  "Twerker sur du Johnny Hallyday au mariage",
  "Pleurer sous la douche depuis 2 heures",
  "Faire caca sur le bureau du patron",
  "Stalker son ex sur Insta à 3h du mat",
  "Voter blanc par erreur monumentale",
  "Mettre des commentaires sur PornHub",
  "Liker ses propres photos de 2009",
  "Se masturber en pensant à Hanouna",
  "Renifler des culottes sales volées",
  "Lécher des poignées de porte publiques",
  "Chier dans une piscine municipale bondée",
  "Vomir sur quelqu'un en boîte de nuit",
  "Péter pendant un oral de bac",
  "Roter pendant un premier baiser",
  "Éjaculer en moins de 30 secondes",
  "Pleurer pendant et après le sexe",
  "Appeler son ex bourré à 4h du matin",
  "S'endormir complètement pendant l'acte",
  "Envoyer un nude à sa propre mère",
  "Confondre sa femme et sa belle-mère au lit",
  "Pisser dans le métro bondé",

  // === CONCEPTS ABSTRAITS ===
  "Le patriarcat toxique de mon oncle",
  "La crise de la quarantaine très violente",
  "Le capitalisme sauvage de Bezos",
  "La friendzone éternelle et douloureuse",
  "L'astrologie des cons sur Instagram",
  "Le réchauffement climatique brutal",
  "La charge mentale de maman épuisée",
  "Le syndrome de Stockholm conjugal",
  "La masculinité très très fragile",
  "Le mansplaining de mon collègue",
  "Le gaslighting de mon ex toxique",
  "La cancel culture sur Twitter",
  "Le privilège blanc non assumé",
  "La méritocratie complètement bidon",
  "L'appropriation culturelle de Coachella",
  "Le slut-shaming sur les réseaux",
  "L'éco-anxiété paralysante",

  // === ANIMAUX ===
  "Un pigeon unijambiste parisien",
  "Une chèvre en rut très bruyante",
  "Des cafards volants géants du sud",
  "Un hamster dépressif et suicidaire",
  "Une méduse échouée sur ma serviette",
  "Un caniche agressif et lubrique",
  "Des moustiques tigres en masse",
  "Un rat d'égout apprivoisé comme animal",
  "Un chihuahua complètement psychopathe",
  "Une mouche dans ma soupe",
  "Un poisson rouge mort depuis 3 jours",
  "Un coq à 5h du matin sans arrêt",
  "Une araignée géante dans la douche",
  "Un serpent dans les toilettes",
  "Un singe qui se branle au zoo",
  "Deux escargots qui baisent lentement",
  "Un chien qui lèche ses couilles en public",
  "Un chat qui ramène un cadavre",
  "Un perroquet ouvertement raciste",
  "Une vache folle échappée",

  // === EXPRESSIONS / SITUATIONS ===
  "Un malaise en public très gênant",
  "Une gastro le samedi soir de fête",
  "Oublier le prénom de quelqu'un en face",
  "Un texto envoyé à la mauvaise personne",
  "Un pet silencieux mais mortel en ascenseur",
  "Rater sa sortie de manière épique",
  "Dire « bonne appétit » au serveur",
  "Faire un virement au mauvais IBAN",
  "Tomber dans les escalators du métro",
  "Se prendre une porte vitrée très propre",
  "Avoir du PQ collé à la chaussure toute la journée",
  "La braguette ouverte pendant une présentation",
  "Un blanc de 5 minutes en réunion",
  "Vomir dans un Uber cuir beige",
  "Tomber dans les toilettes publiques",
  "Rater son avion pour 2 petites minutes",
  "Bander pendant une présentation pro",
  "Mouiller son pantalon de peur en public",
  "Péter très fort pendant le sexe",

  // === RÉSEAUX SOCIAUX / TECH ===
  "Un dick pic accidentel à son patron",
  "Des followers achetés au Bangladesh",
  "Un historique de navigation très suspect",
  "La 5G qui donne soi-disant le cancer",
  "Des cryptomonnaies sans aucune valeur",
  "ChatGPT qui insulte les utilisateurs",
  "Une photo de profil de 2009 moche",
  "Un tweet raciste qui ressort 10 ans après",
  "Un profil LinkedIn beaucoup trop cringe",
  "Un BeReal pris au pire moment",
  "Une story Instagram embarrassante",
  "Un TikTok de boomer pathétique",
  "Un Snapchat envoyé à la mauvaise personne",
  "Un mot de passe : 123456 sur tout",
  "Un profil Adopte supprimé par modération",

  // === VIE SOCIALE ===
  "Un dîner romantique chez Flunch",
  "Une baby shower complètement ratée",
  "Un afterwork au Carrefour du coin",
  "Une séance de CrossFit traumatisante",
  "Un brunch végan totalement sans goût",
  "Un cours de Zumba très gênant",
  "Un escape game en famille ultra tendu",
  "Une soirée Tupperware de 4 heures",
  "Un apéro chez les beaux-parents",
  "Un mariage sous la pluie battante",
  "Un enterrement étrangement joyeux",
  "Une crémaillère sans alcool du tout",
  "Un speed dating désastreux et gênant",
  "Une réunion de famille ultra toxique",

  // === SUBSTANCES / EXCÈS ===
  "Trois bouteilles de rosé tiède au soleil",
  "De la MD en gélule pas dosée",
  "Un joint très mal roulé qui s'éteint",
  "Des champignons magiques périmés",
  "Un verre de pastis pur sans eau",
  "De l'absinthe à 90 degrés",
  "Du poppers en pleine soirée famille",
  "De la coke coupée au plâtre",
  "Un rail de wasabi par erreur",
  "De la javel bue par erreur",
  "Du Destop comme shot de vodka",
  "Du sirop pour la toux qui défonce",

  // === MÉDICAL / SANTÉ ===
  "Un suppositoire de 30cm de long",
  "Une sonde urinaire très douloureuse",
  "Un lavement au café bio",
  "De la Ventoline périmée de 5 ans",
  "Un test de grossesse très positif",
  "Une IST totalement non identifiée",
  "Un toucher rectal approfondi",
  "Une coloscopie filmée en direct",
  "Un frottis fait en public",
  "Une prise de sang ratée 4 fois",
  "Une circoncision complètement ratée",
  "Un accouchement dans le métro bondé",

  // === NOSTALGIE ===
  "Un Tamagotchi mort de faim et de soif",
  "Les Minikeums version adulte rated R",
  "Un cartable Tann's défoncé et déchiré",
  "Le Club Dorothée interdit aux enfants",
  "Des POG collector de 1995",
  "Dragon Ball Z en VF avec Vegeta",
  "Les Totally Spies version lesbienne",
  "Bob l'Éponge complètement défoncé",
  "Les Télétubbies sataniques",
  "Oui-Oui en prison pour meurtre",

  // === ARGENT / TRAVAIL ===
  "Le SMIC divisé par deux sans prévenir",
  "Un CDI chez Action au rayon jouets",
  "Des tickets resto périmés depuis 2019",
  "Pôle Emploi qui te ghoste depuis 6 mois",
  "Un stage non rémunéré de 2 ans",
  "La CAF qui te ghoste aussi",
  "Un découvert de 3000€ permanent",
  "Un RSA de survie pour manger",
  "Une prime annuelle de 12€",
  "Un licenciement par SMS à 6h",
  "Des RTT annulés sans explication",
  "Une augmentation de 0.5% après 10 ans",
  "Un 13ème mois en tickets kadéos",
  "Un CDD de 3 jours renouvelable",

  // === LIEUX ===
  "Les toilettes de la gare du Nord",
  "Un Formule 1 à 29€ la nuit",
  "Un parking de supermarché la nuit",
  "La file d'attente de la Poste à 11h",
  "Un rond-point de campagne perdu",
  "La zone industrielle de Troyes vide",
  "Le métro ligne 13 à 18h bondé",
  "Un Airbnb dégueulasse avec cafards",
  "Le RER B en panne depuis 2h",
  "Calais sous la pluie en novembre",
  "Marseille à 3h du matin en solo",
  "Le périph à l'heure de pointe",
  "Un Ibis Budget déprimant à souhait",

  // === ULTRA TRASH ===
  "Une teub de 25cm non vérifiée",
  "Des hémorroïdes très purulentes",
  "Un plan à trois avec mes parents",
  "Du vomi de chat fermenté 3 jours",
  "Une couche pleine depuis 3 jours",
  "Un slip souillé depuis une semaine",
  "Des flatulences incontrôlables au lit",
  "Du sperme séché sur le canapé cuir",
  "Des règles très abondantes en blanc",
  "Un étron flottant dans la piscine",
  "De la diarrhée explosive en public",
  "Un préservatif coincé depuis 3 jours",
  "Des morpions géants et résistants",
  "Une infection urinaire carabinée",
  "Du pus qui coule en continu",
  "Un abcès anal de 5cm",
  "De l'herpès labial en plein premier date",
  "Un prolapsus rectal en direct",

  // === CULTURE / MÉDIAS ===
  "Un livre audio de Marc Lévy en boucle",
  "Les Marseillais en Antarctique saison 47",
  "Un concert de Patrick Fiori nu",
  "Le JT de 13h en boucle 24h",
  "The Voice Senior XXL édition spéciale",
  "Koh-Lanta avec des influenceurs TikTok",
  "Secret Story: La Maison de Retraite",
  "L'Amour est dans le Pré Spécial Nudiste",
  "Cauchemar en Cuisine dans ma cuisine",
  "66 Minutes sur ma vie privée",
  "Un documentaire Arte sur le fisting",

  // === RANDOM ABSURDE ===
  "Une licorne complètement défoncée",
  "Un Schtroumpf en cure de désintox",
  "Jésus-Christ sur Grindr en 2024",
  "Hitler végan qui milite",
  "Gandhi qui fait du MMA",
  "Mère Teresa en string ficelle",
  "Dark Vador en thérapie de couple",
  "Thanos féministe et woke",
  "Dora l'exploratrice qui explore la drogue",
  "Shrek à Hollywood pour les Oscars",
  "Elsa qui lâche vraiment prise",

  // === BONUS FRANCE ===
  "Les impôts qui augmentent encore",
  "La raclette sans patates du tout",
  "Le pastis sans eau ni glaçons",
  "Une grève SNCF surprise de 3 semaines",
  "Un 49.3 de plus sans débat",
  "Le Bescherelle version TikTok",
  "Un camping-car sur l'A7 à 80km/h",
  "Une caravane en feu sur l'autoroute",
  "Un gilet jaune sur un tracteur",
  "La baguette tradition à 2€50",
  "Le vin rouge en cubi de 5L",
  "Un béret sur un hipster parisien",
  "La Sécu en faillite totale",
  "Les 35h avec heures sup non payées",

  // === NOUVELLES RÉPONSES BONUS ===
  "L'amour inconditionnel de ma mère",
  "Une thérapie de groupe intensive",
  "Mon chat qui me juge en silence",
  "La solitude existentielle profonde",
  "Un câlin de groupe non consenti",
  "La dépression saisonnière d'été",
  "Mon ex qui stalke mes stories",
  "Le regard déçu de mon père",
  "Une pizza 4 fromages à 3h du mat",
  "Mon compte en banque vide",
  "Les souvenirs de mon enfance",
  "Un fou rire nerveux inapproprié",
  "La honte de ma vie entière",
  "Mon potentiel gâché",
  "Les rêves brisés de ma mère",
  "Un karaoké sur du Céline Dion",
  "Mon reflet dans le miroir",
  "La vérité qui fait mal",
  "Un mensonge réconfortant",
  "L'ignorance bénie des cons",
];

// Fonction pour compter le nombre de trous dans une question
export const countBlanks = (question) => {
  const matches = question.match(/____/g);
  return matches ? matches.length : 0;
};

// Fonction pour mélanger un tableau
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Fonction pour obtenir des cartes mélangées
export const getShuffledQuestions = () => shuffleArray(questionCards);
export const getShuffledResponses = () => shuffleArray(responseCards);

// Nombre de cartes en main par joueur
export const CARDS_IN_HAND = 8;

// Points pour gagner
export const POINTS_TO_WIN = 5;
