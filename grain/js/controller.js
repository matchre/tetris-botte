/* controller.js */

OptimalController = function()
{
    this.getValue = function(index)
    {
        /* this function reads the data file and return the optimal score
         * associated to an engine state representend by "index". currently,
         * reading local files in HTML5/JS is pretty hard, to this functios will
         * use a http request to a PHP script that will read the value in a
         * server-side-stored data file and return the number. But in the future
         * it would be better for example to detect if the app is running in 
         * phonegap, and if so, use the phonegap API to read local files on the
         * device.
         */
        var httpRequestUrl = "http://www-sop.inria.fr/science-participative/tetrisbote/?index=" + index;
        var req = new XMLHttpRequest();

        req.open("GET", httpRequestUrl, false);
        req.send();

        return req.responseText;
    }

    var maxv = this.getValue('max');
    var minv = this.getValue('min');
    // var log = document.findElementById("log");

    this.copyMap = function(map)
    {
        var ret = new Array;

        for(var i = 0; i < map.length; i++)
            ret.push(map[i]);

        return ret;
    }

    this.play = function(game, currentMap, currentPieceType)
    {   
        log("C'est mon tour.<br />Je réfléchis...");

        this.game = game;
        this.currentMap = currentMap;
        this.currentPieceType = currentPieceType;

        handle = setInterval("callback()", 1000);
    }

    this.doAction = function()
    {
        var game = this.game;
        var currentMap = this.currentMap;
        var currentPieceType = this.currentPieceType;

        var column;
        var rotation;

        /* determine every possible action. Each will be stored in an array as
         * a couple of 2 numbers : the immediate score you get by performing this
         * action, and the average score you can hope after this action is done.
         * in fine, the action associated with the maximum score-couple will be
         * returned */

        /* entries of this array are 4-elements array : [immediate score, average
         * score, Action(column, rotation), index in data file] */
        var actions = new Array();

        /* for each column... */
        for(var col = 0; col < game.width; col++)
        {
            /* ... try each possible rotate state */
            for(var rotate = 0; rotate < currentPieceType.possibleStates; rotate++)
            {
                var piece = currentPieceType.rotated(rotate);
                var action = new Action(col, rotate)

                /* determine the future map and the immediate score */
                var map = this.copyMap(currentMap);
                var immediateScore = 0;

                var coords = game.placePiece(map, currentPieceType, action, false);

                /* of course, don't count an action that would cause to lost
                 * the game */
                if(coords[1] + piece.height > game.height)
                    continue;

                if(coords[0] != col)
                    continue;

                for(var row = coords[1]; row < game.height; row++)
                {
                    var completed = true;

                    for(var c = 0; c < game.width; c++)
                    {
                        var index = c + row * game.width;

                        if(map[index] == 0)
                        {
                            completed = false;
                            break;
                        }
                    }

                    if(completed)
                    {
                        immediateScore++;

                        /* copy each line in the line below */
                        for(var i = row * game.width; i < game.width * (game.height-1); i++)
                            map[i] = map[i + game.width];

                        /* the last line is blank now, fill it with zeroes */
                        for(var i = (game.height - 1) * game.width; i < map.length; i++)
                            map[i] = 0;

                        /* the above line is now at the index of this one and
                         * must be checked as well, so... */
                        row--;
                    }
                }

                var game_code = 0;
                for(var row = game.height-1; row >= 0; row--)
                {
                    game_code = game_code << game.width;

                    var row_code = 0;

                    for(var c = 0; c < game.width; c++)
                    {
                        var index = c + row * game.width;
                        var bin_value = map[index] == 0 ? 0 : 1;

                        row_code = row_code << 1;
                        row_code = row_code | bin_value;
                    }

                    /* row code is now a 5 bit value representing the row */
                    game_code = game_code | row_code;
                }

                var value = this.getValue(game_code);
                var futureScore = minv + (maxv - minv) * value/256;
                actions.push([immediateScore, futureScore, action, game_code]);
            }
        }

        if(actions.length == 0)
        {
            /* all actions would make us lost. Play a random thing */
            game.userAction(new Action(0, 0));
            return;
        }

        /* find the maximum and return the associate action */
        var bestActionIndex = 0;

        for(var i = 0; i < actions.length; i++)
        {
            var bestActionImmediateScore = actions[bestActionIndex][0];
            var bestActionAverageScore = actions[bestActionIndex][1];
            var bestActionScore = bestActionImmediateScore + bestActionAverageScore;
            var score = (actions[i][0] + actions[i][1]);

            if(Math.max(score, bestActionScore) == score)
            {
                /* this one is better than the previous */
                bestActionIndex = i;
            }
        }

        this.action = actions[bestActionIndex][2];
        log("Je vais jouer l'état " + actions[bestActionIndex][3]);

        /* that is quite dirty but now better way without rewriting everything
         * it ensures that the user can see what the computer plays before
         * lines are completed */
        var coords = game.placePiece(currentMap, currentPieceType, this.action, true);
        computerSurface.drawPiece(currentPieceType, this.action.column, coords[1], this.action.rotation);

        handle = setInterval("callback_finalize()", 500);
    }

    this.finalize = function() 
    {
        /* return the best action found */
        this.game.userAction(this.action);
    }

    this.validate = function()
    {
        return;
    }

    this.otherPlayed = function()
    {
        return;
    }

    this.updateOther = function()
    {
        return;
    }

    this.endGame = function()
    {
        return;
    }
}

callback = function()
{
    clearInterval(handle);
    computerController.doAction();
}

callback_finalize = function()
{
    clearInterval(handle);
    computerController.finalize();
}