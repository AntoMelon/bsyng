const KEY = "bingo_gen";
const DARK_KEY = "darkMode";
const randomRegExp = /%random\(\s*[0-9]+\s*,\s*[0-9]+\s*\)%/;

function randRange(a,b) {
    return Math.floor(Math.random()*(b-a+1))+a;
}

document.addEventListener("DOMContentLoaded", function() {

    /**
     * Esacpes a String to remove HTML tags
     * @param {String} str the String to escape
     */
     function escapeString(str) {
        return str.replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\"","'");
    }


    function addGame(name) {
        let memory = localStorage.getItem(KEY);
        if (memory == null) {
            console.log("no data");
            let obj = {};
            obj[name] = [];

            localStorage.setItem(KEY,JSON.stringify(obj));
            window.location.reload();
        } else {
            memory = JSON.parse(memory);
            if (memory[name] != undefined) {
                alert("Game has already been added.");
                return;
            } else {
                memory[name] = [];

                localStorage.setItem(KEY,JSON.stringify(memory));
                window.location.reload();
            }
        }
    }

    function removeSelectedGame() {
        let memory = localStorage.getItem(KEY);
        if (memory == null) {
            alert("No game has been registered yet.");
        }

        let num = document.getElementById("games").selectedIndex;

        if (num == 0) {
            alert("No game is selected.");
            return;
        }

        if (!window.confirm("Are you sure? This action cannot be undone!")) {
            return;
        }

        let name = document.getElementById("games").value;

        memory = JSON.parse(memory);

        delete memory[name];
        localStorage.setItem(KEY,JSON.stringify(memory));
        window.location.reload();
    }

    function loadGames() {
        let memory = localStorage.getItem(KEY);
        if (memory == null) {
            return;
        }

        memory = JSON.parse(memory);

        let sel = document.getElementById("games");

        for (let game in memory) {
            sel.innerHTML+= "<option value=\""+game+"\">"+game+"</option>"
        }
    }

    function addObjective(objective) {
        let num = document.getElementById("games").selectedIndex;

        if (num == 0) {
            alert("No game is selected.");
            return;
        }

        let game = document.getElementById("games").value;

        let memory = localStorage.getItem(KEY);
        if (memory == null) {
            return;
        }

        memory = JSON.parse(memory);

        memory[game].push(escapeString(objective));

        document.getElementById("fieldAddObjective").value = "";

        localStorage.setItem(KEY,JSON.stringify(memory));
    }

    function loadObjectivesFromSelectedGame() {
        let memory = localStorage.getItem(KEY);
        if (memory == null) {
            return;
        }
        memory = JSON.parse(memory);

        let name = document.getElementById("games").value;

        let objectives = document.getElementById("objectives");
        objectives.innerHTML = "";

        for (let objective of memory[name]) {
            objectives.innerHTML += "<tr><td><button class=\"delete\"></button></td><td>"+objective+"</td></tr>"; 
        }

        updateObjectivesNumberWith(memory[name].length);

        loadCustomObjectivesButton();

        clearOutput();
    }

    function generateJSON() {
        let memory = localStorage.getItem(KEY);
        if (memory == null) {
            return;
        }

        let num = document.getElementById("games").selectedIndex;

        if (num == 0) {
            alert("No game is selected.");
            return;
        }

        let game = document.getElementById("games").value;

        memory = JSON.parse(memory);

        if (memory[game].length < 25) {
            alert("You need at least 25 objectives (currently "+memory[game].length+").");
            return;
        }

        let copy = [];

        for (let obj of memory[game]) {
            copy.push(obj);
        }

        let output = "[";

        for (let i = 0; i < 25; ++i) {
            let id = Math.floor(Math.random()*copy.length);

            let objective = subAccToGame(game,copy[id]);

            output += "{\"name\": \""+objective+"\"}";

            if (i < 24) {
                output += ",";
            }

            copy.splice(id,1);
        }
        output += "]";


        let target = document.getElementById("output");
        target.innerHTML = "";
        target.setAttribute('readonly',true);
        target.innerHTML += output;

        document.getElementById("output").scrollIntoView({behavior: "smooth"});
    }

    function clearOutput() {
        let target = document.getElementById("output");
        target.innerHTML = "";
    }


    function loadCustomObjectivesButton() {
        let currGame = document.getElementById("games").value.toLowerCase();
        let codesDiv = document.getElementById("game_codes");
        codesDiv.innerHTML = "";

        if (currGame === "hollow knight" || currGame === "hollow_knight" || currGame === "hk") {
            codesDiv.innerHTML += "<h2>Detected game: Hollow Knight</h2>";

            codesDiv.innerHTML += "<p>Use <strong>%enemy%</strong> for a random enemy</p>";
            codesDiv.innerHTML += "<p>Use <strong>%charm%</strong> for a random charm</p>";

        } else if (currGame === "minecraft" || currGame === "mc") { 
            codesDiv.innerHTML += "<h2>Detected game: Minecraft</h2>";

            codesDiv.innerHTML += "<p>Use <strong>%mob%</strong> for a random mob</p>";
            codesDiv.innerHTML += "<p>Use <strong>%hostile%</strong> for a random hostile mob</p>";
            codesDiv.innerHTML += "<p>Use <strong>%biome%</strong> for a random biome (WIP)</p>";
        } else {
            codesDiv.innerHTML += "<p>No special codes implemented for this game</p>";
        }
    }

    function updateObjectivesNumberWith(i) {
        let num = document.getElementById("objNumber");
        num.innerHTML = ""+i;
    }


    
    function initiateDarkMode() {
        let bool = localStorage.getItem(DARK_KEY);
        if (bool == "true") {
            let body = document.body;
            body.classList.toggle("dark");
        }
    }


    function toggleDarkInStorage() {
        let bool = localStorage.getItem(DARK_KEY);
        if (bool == null) {
            localStorage.setItem(DARK_KEY,"true");
            return;
        }

        if (bool == "false") {
            localStorage.setItem(DARK_KEY,"true");
            return;
        }

        localStorage.setItem(DARK_KEY,"false");
    }





    /*----------MAIN PROGRAM----------*/

    document.addEventListener("keydown", function(e) {
        if (e.key == "d" && e.altKey) {
            e.preventDefault();
            let body = document.body;
            body.classList.toggle("dark");
            toggleDarkInStorage();
            return;
        }
    });

    initiateDarkMode();
    loadGames();

    let btnAddGame = document.getElementById("btnAddGame");
    btnAddGame.addEventListener("click",function(e) {
        let name = escapeString(document.getElementById("fieldAddGame").value);
        document.getElementById("fieldAddGame").value = "";
        
        if (name.trim() == "") {
            alert("Name must not be empty");
        }

        addGame(name);


    })

    let btnRemoveGame = document.getElementById("btnRemoveGame");
    btnRemoveGame.addEventListener("click",function(e) {
        removeSelectedGame();
    });

    let btnLoadObjectives = document.getElementById("btnLoadObjectives");
    btnLoadObjectives.addEventListener("click",function(e) {
        loadObjectivesFromSelectedGame();
    });

    let btnAddObjective = document.getElementById("btnAddObjective");
    btnAddObjective.addEventListener("click", function(e) {
        addObjective(document.getElementById("fieldAddObjective").value);
        loadObjectivesFromSelectedGame();
    });

    let btnGenerate = document.getElementById("btnGenerate");
    btnGenerate.addEventListener("click",function(e) {
        loadObjectivesFromSelectedGame();
        generateJSON();
    })

    let btnCopy = document.getElementById("btnCopy");
    btnCopy.addEventListener("click",function(e) {
        let copyText = document.getElementById("output");
        navigator.clipboard.writeText(copyText.innerHTML).then(function() {
            alert("Copied successfully!");
          }, function() {
            alert("Failed to copy.");
          });
    });


    let objectivesTable = document.querySelector("table");
    objectivesTable.addEventListener("click",function(e) {
        if (e.target.tagName == "BUTTON") {

            // Access objective text from the button: button UP td[0] UP td DOWN td[1] DOWN text
            let objective = e.target.parentElement.parentElement.children[1].innerHTML;
            objective = objective.replace('<button class=\"delete\"></button>','');


            let memory = localStorage.getItem(KEY);
            if (memory == null) {
                return;
            }

            let num = document.getElementById("games").selectedIndex;

            if (num == 0) {
                alert("No game is selected.");
                return;
            }

            let game = document.getElementById("games").value;

            memory = JSON.parse(memory);


            for (let i = 0; i < memory[game].length; ++i) {
                if (memory[game][i] == objective) {
                    memory[game].splice(i,1);
                    break;
                }
            }

            localStorage.setItem(KEY,JSON.stringify(memory));
            loadObjectivesFromSelectedGame();
            
        }
    });






    /*-----Special Objectives Functions-----*/

    /*---Hollow Knight---*/

    const hkEnemies = ["Crawlid", "Vengefly / Mouche Vengeresse", "Vengefly King / Mouche Vengeresse Royale", "Gruzzer",
                        "Gruz Mother / Mère de Gruz", "Tiktik", "Aspid Hunter / Aspid Chasseresse", "Aspid Mother / Mère Aspid",
                        "Aspid Hatchling / Nouveau-né Aspid", "Goam", "Wandering Husk / Carcasse Vagabonde", "Husk Hornhead / Carcasse Cornue",
                        "Leaping Husk / Carcasse Sauteuse", "Husk Bully / Carcasse Malmeneuse", "Husk Warrior / Carcasse Guerrière", "Husk Guard / Carcasse de la Défense",
                        "Entombed Husk / Carcasse Enterrée", "False Knight / Faux Chevalier", "Maggot", "Menderbug / Fixeur",
                        "Lifeseed / Graine-de-vie", "Baldur", "Elder Baldur / Ancien Baldur", "Mosscreep / Rampant Moussu",
                        "Mossfly / Mouche Moussue", "Mosskin / Moussu", "Volatile Mosskin / Moussu Instable", "Fool Eater / Mangesot",
                        "Squit / Moustique", "Obble", "Gulka", "Maskfly / Mouche masquée",
                        "Moss Charger / Emboutisseur Moussu", "Massive Moss Charger / Emboutisseur Moussu Massif", "Moss Knight / Chevalier Moussu", "Mossy Vagabond / Vagabond Moussu",
                        "Durandoo", "Duranda", "Aluba", "Charged Lumafly / Lumafly chargée",
                        "Uoma", "Ooma", "Uumuu", "Ambloom",
                        "Fungling / Bulling", "Fungoon / Bullboon", "Sporg", "Fungified Husk / Carcasse Fongifiée",
                        "Shrumeling / Champiling", "Shrumal Warrior / Guerrier Champignon", "Shrumal Ogre / Ogre Fongique", "Mantis Youth / Jeune Mante",
                        "Mantis Warrior / Mante Guerrière", "Mantis Lords / Dames Mantes" ,"Husk Sentry / Sentinelle Vide", "Heavy Sentry / Sentinelle Armée",
                        "Winged Sentry / Sentinelle Ailée", "Lance Sentry / Sentinelle à l'Aiguillon Long", "Mistake / Erreur", "Folly",
                        "Soul Twister / Tourmenteur de l'Âme", "Soul Warrior / Guerrier de l'Âme", "Soul Master / Maître de l'Âme", "Husk Dandy / Carcasse Prétentieuse",
                        "Cowardly Husk / Carcasse Peureuse", "Gluttonous Husk / Carcasse Gloutonne", "Gorgeous Husk / Carcasse Magnifique", "Great Husk Sentry / Sentinelle Vide Armée",
                        "Watcher Knight / Veilleur", "The Collector / Le Collecteur", "Belfly", "Pilflip",
                        "Hwurmp", "Bluggsac", "Dung Defender / Défenseur Bousier", "White Defender / Défenseur Blanc",
                        "Flukefey", "Flukemon", "Flukemunga", "Flukemarm",
                        "Shardmite / Mite de Cristal", "Glimback", "Crystal Hunter / Chasseur de Cristaux", "Crystal Crawler / Rampant de Cristal",
                        "Husk Miner / Carcasse Mineuse", "Crystallised Husk / Carcasse Cristallisée", "Crystal Guardian / Gardien de Cristal", "Furious Vengefly / Mouche Vengeresse Enragée",
                        "Volatile Gruzzer / Gruzzer Instable", "Violent Husk / Carcasse Violente", "Slobbering Husk / Carcasse Baveuse", "Dirtcarver / Fouisseur",
                        "Carver Hatcher / Fouisseur Incubateur", "Garpede", "Corpse Creeper / Nécrosite", "Deepling / Mini-Araignée",
                        "Deephunter / Araignée Cracheuse", "Little Weaver / Tisseur", "Stalking Devout / Adorateur Fouineur", "Nosk",
                        "Shadow Creeper / Rampant des Ombres", "Lesser Mawlek / Mawlek Inférieur", "Mawlurk", "Brooding Mawlek / Mawlek Maussade",
                        "Lightseed / Blob Parasite", "Infected Balloon / Bulle Infectée", "Broken Vessel / Vaisseau Corrompu", "Boofly / Mouche Boursouflée",
                        "Primal Aspid / Aspid Sauvage", "Hopper / Sautilleur", "Great Hopper / Grand Sautilleur", "Grub Mimic / Larve Caméleon",
                        "Hiveling / Ruchelin", "Hive Soldier / Soldat de la Ruche", "Hive Guardian / Gardien de la Ruche", "Husk Hive / Carcasse d'Abeilles",
                        "Hive Knight / Chevalier de la Ruche", "Spiny Husk / Carcasse Épineuse", "Loodle", "Mantis Petra / Mante Petra",
                        "Mantis Traitor / Mante Traître", "Traitor Lord / Seigneur Traître", "Sharp Baldur / Baldur Endurci", "Armoured Squit / Moustique Cuirassé",
                        "Battle Obble / Combattant Obble", "Oblobble", "Shielded Fool / Fou Cuirassé", "Sturdy Fool / Fou Robuste",
                        "Winged Fool / Fou Ailé", "Heavy Fool / Fou Massif", "Death Loodle / Loodle de la Mort", "Volt Twister / Manipulateur Voltaïque",
                        "God Tamer / Dompteur de Dieux", "Pale Lurker / Rôdeuse Pâle", "Zote the Mighty / Zote le Redoutable", "Grey Prince Zote / Zote le Prince Gris",
                        "Winged Zoteling / Zoteling Ailé", "Hopping Zoteling / Zoteling Sautant", "Volatile Zoteling / Zoteling Instable", "Xero",
                        "Gorb", "Elder Hu / Hu l'Ancien", "Marmu", "No-Eyes / Sans-Yeux",
                        "Galien", "Markoth", "Grimmkin Novice / Grimm Novice", "Grimmkin Master / Grimm Despote",
                        "Grimmkin Nightmare / Grimm Cauchemardesque", "Grimm / Grimm Maître de la Troupe", "Nightmare King / Roi des Cauchemars Grimm", "Nailmasters Oro and Mato / Frères Oro et Mato",
                        "Paintmaster Sheo / Maître Peintre Sheo", "Great Nailsage Sly / Grand Maître d'Aiguillons Sly", "Winged Mould / Corps Ailé", "Royal Retainer / Serviteur Royal",
                        "Kingsmould / Corps-Royal", "Sibling / Famille", "Void Tendils / Tentacules du Vide", "Hornet",
                        "Hollow Knight", "Pure Vessel / Vaisseau Pur", "Radiance", "Shade / Ombre",
                        "Seal of Binding / Sceau de Lien"];

    const hkCharms = ["Wayward Compass / Boussole Murmurante", "Gathering Swarm / Essaim Cueilleur", "Stalwart Shell / Carapace Infrangible", "Soul Catcher / Capturâme", 
                    "Shaman Stone / Pierre du Shaman", "Soul Eater / Mangeur d'Âme", "Dashmaster / Maître de la Célérité", "Speedmaster / Maître de la Vitesse", 
                    "Chant des Larves / Grubsong", "Grubberfly's Elegy / Larve-mouche élégie", "Fragile Heart / Coeur Fragile", "Unbreakable Heart / Coeur Indestructible", 
                    "Fragile Greed / Avarice Fragile", "Unbreakable Greed / Avidité Indestructible", "Fragile Strength / Force Fragile", "Unbreakable Strength / Force Indestructible",
                    "Spell Twister / Tourmenteur d'Âme", "Steady Body / Roc Solide", "Heavy Blow / Coup Puissant", "Quick Slash / Entaille Rapide",
                    "Long Nail / Longue-Lame", "Mark of Pride / Marque de Respect", "Fury of the Fallen / Fureur des Disparus", "Thorns of Agony / Épines d'Agonie",
                    "Baldur Shell / Carapace de Baldur", "Flukenest / Nid de Flukes", "Defender's Crest / Écu du Défenseur", "Glowing Womb / Ventre Rutilant",
                    "Quick Focus / Canalisation Rapide", "Deep Focus / Canalisation Intense", "Lifeblood Heart / Coeur Sang-de-Vie", "Lifeblood Core / Noyau Sang-de-Vie",
                    "Joni's Blessing / Bénédiction de Joni", "Hiveblood / Sang-de-Ruche", "Spore Shroom / Champi-spore", "Sharp Shadow / Ombre Tranchante",
                    "Shape of Unn / Forme d'Unn", "Nailmaster's Glory / Gloire du Maître d'Aiguillons", "Weaversong / Chant du Tisserand", "Dream Wielder / Porteur de Rêves",
                    "Dreamshield / Bouclier Éthéré", "Grimmchild 0 / L'Héritier de Grimm 0", "Grimmchild 1 / L'Héritier de Grimm 1", "Grimmchild 2 / L'Héritier de Grimm 2",
                    "Grimmchild 3 / L'Héritier de Grimm 3", "Grimmchild 4 / L'Héritier de Grimm 4", "Carefree Melody / Mélodie Insouciante", "Kingsoul / Âme-royale",
                    "Void Heart / Coeur du Vide"];


    function hkEnemyEntry() {
        let id = Math.floor(Math.random()*hkEnemies.length);
        var enemy = hkEnemies[id];

        return enemy;
    }

    function hkCharm() {
        let id = Math.floor(Math.random()*hkCharms.length);
        var charm = hkCharms[id];

        return charm;
    }


    function hkSubstitution(string) {
        return string.replaceAll("%enemy%",hkEnemyEntry()).replaceAll("%charm%",hkCharm());
    }

    /*-----------------------------------------------------*/

    /*---Minecraft---*/

    const mcMobs = ["Axolotl", "Bat", "Cat", "Chicken", "Cod", "Cow",
                    "Donkey", "Fox", "Glow Squid", "Horse", "Mooshroom", "Mule",
                    "Ocelot", "Parrot", "Pig", "Pufferfish", "Rabbit", "Salmon",
                    "Sheep", "Skeleton Horse", "Snow Golem", "Squid", "Strider", "Tropical Fish",
                    "Turtle", "Villager", "Wandering Trader", "Bee", "Cave Spider", "Dolphin",
                    "Enderman", "Goat", "Iron Golem", "Llama", "Panda", "Piglin",
                    "Polar Bear", "Spider", "Trader Llama", "Wolf", "Zombified Piglin", "Blaze",
                    "Chicken Jockey", "Creeper", "Drowned", "Elder Guardian", "Endermite", "Evoker",
                    "Ghast", "Guardian", "Hoglin", "Husk", "Magma Cube", "Phantom", "Piglin Brute",
                    "Pillager", "Ravager", "Shulker", "Silverfish", "Skeleton", "Skeleton Horseman",
                    "Slime", "Spider Jockey", "Stray", "Vex", "Vindicator", "Witch",
                    "Wither Skeleton", "Zoglin", "Zombie", "Zombie Villager", "Ender Dragon", "Wither"];

    const mcHostiles = ["Blaze", "Chicken Jockey", "Creeper", "Drowned", "Elder Guardian", "Endermite", "Evoker",
                    "Ghast", "Guardian", "Hoglin", "Husk", "Magma Cube", "Phantom", "Piglin Brute",
                    "Pillager", "Ravager", "Shulker", "Silverfish", "Skeleton", "Skeleton Horseman",
                    "Slime", "Spider Jockey", "Stray", "Vex", "Vindicator", "Witch",
                    "Wither Skeleton", "Zoglin", "Zombie", "Zombie Villager", "Ender Dragon", "Wither"];

    function mcMob() {
        let id = Math.floor(Math.random()*mcMobs.length);
        var mob = mcMobs[id];

        return mob;
    }

    function mcHostile() {
        let id = Math.floor(Math.random()*mcHostiles.length);
        var mob = mcHostiles[id];

        return mob;
    }

    function mcSubstitution(string) {
        return string.replaceAll("%mob%",mcMob()).replaceAll("%hostile%",mcHostile());
    }

    /*-----------------------------------------------------*/

    function interpretAndSubRandoms(string) {
        let match = randomRegExp.exec(string);

        var res = string;

        while (match) {
            let idxFstStart = match.index + 8;
            let idxFstEnd = idxFstStart + 1;

            while (res.charAt(idxFstEnd) != ',') {
                ++idxFstEnd;
            }

            let idxLstStart = idxFstEnd + 1;
            let idxLstEnd = idxLstStart + 1;

            while (res.charAt(idxLstEnd) != ')') {
                ++idxLstEnd;
            }

            let inf_range = res.substring(idxFstStart,idxFstEnd);
            let sup_range = res.substring(idxLstStart,idxLstEnd);

            res = res.replace(randomRegExp,randRange(Number(inf_range),Number(sup_range)));
            match = randomRegExp.exec(res);
        }

        return res;
    }

    function subAccToGame(game, string) {
        let currGame = game.toLowerCase();
        let currStr = string;

        while (randomRegExp.exec(currStr)) {
            currStr = interpretAndSubRandoms(currStr);
        }
        

        if (currGame === "hollow knight" || currGame === "hollow_knight" || currGame === "hk") {
            return hkSubstitution(currStr);
        }

        if (currGame === "minecraft" || currGame === "mc") {
            return mcSubstitution(currStr);
        }

        return currStr;
    }

});