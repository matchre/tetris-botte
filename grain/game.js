/* game.js */

GameEngine = function(config)
{
    var width = config['MapWidth'];
    var height = config['MapHeight'];
    var players = new Array();
    var piece;
    var currentPlayer;

    this.reset = function()
    {
        /* reset the map of every player */
        for(var i = 0; i < players.length; i++)
        {
            var map = new Array();

            for(var j = 0; j < width * height; j++)
                map[j] = 0;

            players[i] = new Player(players[i].controller, map)

            for(var j = 0; j < players.length; j++)
                players[j].controller.updateOther(players[i], map);
        }
    }

    this.__defineGetter__("width", function() 
    { 
        return width; 
    });

    this.__defineGetter__("height", function() 
    { 
        return height; 
    });

    this.__defineGetter__("map", function() 
    { 
        return map; 
    });

    /* Rand a new piece. Get a random index inside the pieceTypes array */
    var generatePiece = function()
    {
        var p = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
        var color = colors[Math.floor(Math.random() * colors.length)];
        p.color = color;

        return p;
    }

    this.addPlayer = function(controller)
    {
        var map = new Array();
        for(var i = 0; i < width * height; i++)
            map[i] = 0;

        players.push(new Player(controller, map));
    }

    this.placePiece = function(map, piece, action, simulate)
    {
        var p = piece.rotated(action.rotation);

        if(p == undefined)
            p = piece.rotated(0);

        /* first of all, stretch the x pos */
        var x = Math.min(width - p.width, action.column);

        for(var row = height; row > 0; row--)
        {
            /* can we drop the piece here ? */
            var obstacle = false;

            for(var i = 0; i < p.width; i++)
            {
                for(var j = 0; j < p.height; j++)
                {
                    var indexInMask = i + j * p.width;

                    if(p.mask[indexInMask] != 0)
                    {
                        var index = x + i + (row + j - 1) * width;

                        /* if there is an obstacle stop, else, continue to the
                         * next column */
                        if(map[index] != 0 && map[index] != undefined)
                            obstacle = true;

                        break;
                    }
                }

                /* we have an obstacle in this column */
                if(obstacle)
                    break;
            }

            if(obstacle)
                break;
        }

        /* returns the coordinates where the piece has been put */
        var ret = new Array();
        ret[0] = x;
        ret[1] = row;

        /* if simulate is not set to true, modify the map to put the piece */
        if(!simulate)
        {
            /* merge piece with map */
            for(var col = 0; col < p.width; col++)
            {
                for(var row = 0; row < p.height; row++)
                {
                    var indexInMask = col + row * p.width;

                    if(p.mask[indexInMask] == 1)
                    {
                        var x = ret[0] + col;
                        var y = ret[1] + row;
                        var indexInMap = x + y * width;

                        map[indexInMap] = piece.color;
                    }
                }
            }
        }

        return ret;
    }

    this.start = function()
    {
        /* main game loop 
         * Each iteration is a "turn" of the game :
         * - rand a new Piece and tell the controllers 
         * - wait for every controller to play 
         * - tell the GUI to update 
         * - check if a player has lost 
         * - check for full lines, add score, etc.
         * - tell the GUI to update (again)
         */

        console.log("New turn");

        /* 1. generate piece */
        piece = generatePiece();

        /* wait for the first controller to play */
        currentPlayer = 0;
        players[0].controller.play(this, players[0].map, piece)
    }

    /* each controller play turn by turn. When this function is called, it
     * means the current player has played */
    this.userAction = function(action)
    {
        /* ther current player */
        var p = players[currentPlayer];
        p.hasPlayed = true;

        /* what has he played ? */
        var coords = this.placePiece(p.map, piece, action, false);
        var playedPiece = piece.rotated(action.rotation);

        /* cheesy hack so that the user can see what the computer played 
         * before the map is updated and the lines completed */
        for(var i = 0; i < players.length; i++)
                players[i].controller.otherPlayed(p, piece, coords, action.rotation);

        /* 4. has he failed ? check if the piece is above limit */
        if(coords[1] + playedPiece.height > height)
        {
            /* HAHA FAIL PWNED LOL \o/ */
            for(var i = 0; i < players.length; i++)

                /* tiny hack, send the action that made this player lost the
                 * game so that i will be displayed by others even if out of the
                 * map */
                players[i].controller.endGame(p != players[i], piece, coords, action.rotation);
            
            return;
        }

        /* 5. check if he has completed lines. Browse each line starting
         * with the one he put the piece at (he can't have completed
         * anything below) 
         */
        var map = p.map;

        for(var row = coords[1]; row < height; row++)
        {
            var completed = true;

            for(var col = 0; col < width; col++)
            {
                var index = col + row * width;

                if(map[index] == 0)
                {
                    completed = false;
                    break;
                }
            }

            if(completed)
            {
                /* copy each line in the line below */
                for(var i = row * width; i < width * (height-1); i++)
                    map[i] = map[i + width];

                /* the last line is blank now, fill it with zeroes */
                for(var i = (height - 1) * width; i < map.length; i++)
                    map[i] = 0;

                /* the above line is now at the index of this one and
                 * must be checked as well, so... */
                row--;
            }
        }

        /* 6. validate action */
        p.controller.validate(map);

        /* tell other players what he has played */
        for(var i = 0; i < players.length; i++)
        {
            if(i == currentPlayer)
                continue;

            players[i].controller.updateOther(p, map);
        }

        currentPlayer++;
        console.log("currentPlayer is " + currentPlayer)
        console.log(players.length)

        if(currentPlayer == players.length)
        {
            /* everybody played */
            console.log("everybody played");
            for(var i = 0; i < players.length; i++)
                players[i].hasPlayed = false;

            this.start();
        }

        /* else, wait for the next player */
        players[currentPlayer].controller.play(this, players[currentPlayer].map, piece);
    }
}

Player = function(controller, map)
{
    var m_controller = controller;
    var m_map = map;

    this.__defineGetter__("map", function() 
    { 
        return m_map; 
    });
    
    this.__defineGetter__("controller", function() 
    { 
        return m_controller; 
    });
    
    // this.hasPlayed = false;
}

PieceMask = function(width, height, map)
{
    var m_width = width;
    var m_height = height;
    var m_map = map;
    
    this.__defineGetter__("width", function() 
    { 
        return m_width; 
    });
    
    this.__defineGetter__("height", function() 
    { 
        return m_height; 
    });
    
    this.__defineGetter__("map", function() 
    { 
        return m_map; 
    });
}

PieceType = function(pieces)
{
    var m_possibleStates = pieces.length;
    var m_pieces = pieces;

    this.__defineGetter__("possibleStates", function() 
    { 
        return m_possibleStates 
    });

    this.rotated = function(state)
    {
        if(state < m_possibleStates)
            return m_pieces[state];
    }
}

Piece = function(width, height, mask)
{
    var m_width = width;
    var m_height = height;
    var m_mask = mask;
    
    this.__defineGetter__("width", function() 
    { 
        return m_width; 
    });
    
    this.__defineGetter__("height", function() 
    { 
        return m_height; 
    });
    
    this.__defineGetter__("mask", function() 
    { 
        return m_mask; 
    });
}

Action = function(column, rotation)
{
    var m_column = column;
    var m_rotation = rotation;

    this.__defineGetter__("column", function() 
    { 
        return m_column; 
    });
    
    this.__defineGetter__("rotation", function() 
    { 
        return m_rotation; 
    }); 
}

engine = undefined;
getEngine = function()
{
    return engine;
}

log = function(message)
{
    var logDiv = window.document.getElementById("log");
    logDiv.innerHTML = message;
}