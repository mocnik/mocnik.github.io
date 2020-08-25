Game.Win('Third-party');
if(InsideTrading === undefined) var InsideTrading = {};
if(typeof CCSE == 'undefined') Game.LoadMod('https://klattmose.github.io/CookieClicker/' + (0 ? 'Beta/' : '') + 'CCSE.js');
InsideTrading.name = 'Inside Trading';
InsideTrading.version = '0.1a';
InsideTrading.GameVersion = '2.029';

InsideTrading.launch = function(){

    InsideTrading.init = function(){
        InsideTrading.isLoaded = 1;

        InsideTrading.ReplaceGameMenu();
        InsideTrading.AddStatsTable();
        InsideTrading.ReplaceNativeMarket();

        //***********************************
        //    Post-Load Hooks
        //    To support other mods interfacing with this one
        //***********************************
        if(InsideTrading.postloadHooks) {
            for(var i = 0; i < InsideTrading.postloadHooks.length; ++i) {
                InsideTrading.postloadHooks[i]();
            }
        }

        if (Game.prefs.popups) Game.Popup(InsideTrading.name + ' loaded!');
        else Game.Notify(InsideTrading.name + ' loaded!', '', '', 1, 1);

        InsideTrading.Logic();
    }

    //***********************************
    //    HTML Template
    //***********************************

    InsideTrading.htmlTemplate = `
<div id="inside-trading-container" style="position:absolute;">
    <style>
        #it-table {
            display: block;
            position: absolute;
            color: #fff;
            background-color: rgba(0,0,0,.5);
            text-shadow: black -1px 0px, black 0px 1px, black 1px 0px, black 0px -1px;
            font-weight: bold;
            padding: 2px;            
            white-space: nowrap;        
        }
        #it-table tr {
            margin-bottom: 1px;
        }
        #it-table td {
            color: #dddddd;
        }
    </style>
    <table id="it-table">
    </table>
</div>
`

    //***********************************
    //    Menu Replacer
    //***********************************

    InsideTrading.ReplaceGameMenu = function(){
        Game.customStatsMenu.push(function(){
            CCSE.AppendStatsVersionNumber(InsideTrading.name, InsideTrading.version);
        });
    }

    InsideTrading.AddStatsTable = function() {
        document.getElementById('bankGraphCols').insertAdjacentHTML('afterend', InsideTrading.htmlTemplate);

        var M = Game.Objects['Bank'].minigame;
        let table = document.getElementById('it-table');

        for(var iG = 0; iG < M.goodsById.length; iG++){
            var good = M.goodsById[iG];

            document.getElementById('it-table').insertAdjacentHTML('beforeend', `
<tr id="it-${good.id}">
    <td>${good.symbol}</td>
    <td><span class="it-value">${good.val}</span>(<span class="it-resting"></span>)</td>
    <td><span class="it-delta">${good.d}</span></td>
    <td><span class="it-mode"></span></td>
    <td><span class="it-duration"></span></td>
</tr>`);
        }
    }


    //***********************************
    //    Functionality
    //***********************************

    InsideTrading.ReplaceNativeMarket = function() {
        if(!Game.customMinigame['Bank'].tick) Game.customMinigame['Bank'].tick = [];
        Game.customMinigame['Bank'].tick.push(InsideTrading.Logic);
    }

    function round(num) {
        return num.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping:false});
    }

    InsideTrading.mode = ["Stable", "Slow Up", "Slow Down", "Fast Up", "Fast Down", "Chaotic"];
    InsideTrading.modeColors = [
        '#cccccc',
        '#00aa00', '#aa0000',
        '#00ff00', '#ff0000',
        '#d2683e']

    InsideTrading.durationColor = function(duration) {
        if (duration < 20) {
            return 'red';
        } else if (duration < 60) {
            return 'orange';
        } else {
            return '#cccccc';
        }
    }

    InsideTrading.restingColor = function(value, restingValue) {
        if (value > restingValue) {
            return '#cccccc';
        } else if (value < restingValue * 0.5) {
            return 'red';
        } else {
            return 'orange';
        }
    }

    InsideTrading.Logic = function(){
        var M = Game.Objects['Bank'].minigame;
        let table = document.getElementById('it-table');

        for(var iG = 0; iG < M.goodsById.length; iG++){
            var good = M.goodsById[iG];

            let row = table.querySelector(`#it-${good.id}`);
            row.querySelector('.it-value').innerHTML = round(good.val);
            row.querySelector('.it-delta').innerHTML = round(good.d);

            let restingNode = row.querySelector('.it-resting');
            restingNode.innerHTML = M.getRestingVal(good.id);
            restingNode.style.color = InsideTrading.restingColor(good.val, M.getRestingVal(good.id));

            let modeNode = row.querySelector('.it-mode');
            modeNode.innerHTML = InsideTrading.mode[good.mode];
            modeNode.style.color = InsideTrading.modeColors[good.mode];

            let durationNode = row.querySelector('.it-duration');
            durationNode.innerHTML = good.dur
            durationNode.style.color = InsideTrading.durationColor(good.dur);
        }
    }

    if(CCSE.ConfirmGameVersion(InsideTrading.name, InsideTrading.version, InsideTrading.GameVersion)) InsideTrading.init();
}

if(!InsideTrading.isLoaded){
    if(CCSE && CCSE.isLoaded){
        InsideTrading.launch();
    }
    else{
        if(!CCSE) var CCSE = {};
        if(!CCSE.postLoadHooks) CCSE.postLoadHooks = [];
        CCSE.postLoadHooks.push(InsideTrading.launch);
    }
}
