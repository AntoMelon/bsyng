const KEY = "bingo_gen";
const DARK_KEY = "darkMode";
const randomRegExp = /%random\(\s*[0-9]+\s*,\s*[0-9]+\s*\)%/;

const detectedGames = {"mc": ["minecraft", "mc"], "hk": ["hollow knight", "hk"]};

var currentGameCodes = null;

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

            let objective = codesSubstitution(copy[id]);

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

        let foundGame = false;
        for (const gameId in detectedGames) {
            for (const acceptedGameId of detectedGames[gameId]) {
                if (currGame == acceptedGameId) {
                    foundGame = true;
                    fetch('./game_codes/'+gameId+'.json').then(response => response.json()).then(function (data) {
                        currentGameCodes = data;

                        codesDiv.innerHTML += "<h2>Detected game: "+ currentGameCodes["game_name"] +"</h2>";
                        for (const code of currentGameCodes["codes"]) {
                            codesDiv.innerHTML += "<p>Use <strong>"+code["pattern"]+"</strong> for "+code["text"]+"</p>";
                        }
                     })
                }
                if (foundGame) break;
            }
            if (foundGame) break;
        }

        if (!foundGame) {
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


    /*--------------------------Substitution functions---------------------------*/

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

    function randomInArray(array) {
        var res = array[randRange(0,array.length-1)];
        return res
    }

    function gameCodesSubtitution(string) {
        if (currentGameCodes == null) {
            return;
        }

        for (code of currentGameCodes["codes"]) {
            string = string.replaceAll(code["pattern"],randomInArray(code["values"]));
        }

        return string;
    }

    function codesSubstitution(string) {
        let currStr = string;

        while (randomRegExp.exec(currStr)) {
            currStr = interpretAndSubRandoms(currStr);
        }
        
        return gameCodesSubtitution(currStr);
    }

});