enchant();

GameSurface = function(game, width, height, blockWidth, blockHeight, x, y)
{
    var surfaceMap = new Array();

    for(var i = 0; i < width; i++)
    {
        for(var j = 0; j < height; j++)
        {
            var index = i + j*width;
         
            var sur = new Surface(blockWidth, blockHeight);
            var block = new Sprite(blockWidth, blockHeight);
            sur.context.fillStyle = '#000000';
            sur.context.fillRect(0, 0, sur.width, sur.width);

            block.image = sur;
            block.x = sur.width * i + x;
            block.y = game.height - (j + 1) * sur.height + y;

            /* we have to copy a var otherwise the closure is catch by 
             * reference and onClick is always called with a param of 5 
             */
            block.addEventListener("touchend", (function(col)
            {
                return function() { window.onClick(col); };
            })(i));

            game.rootScene.addChild(block);
            surfaceMap[index] = sur;
        }

        /* add 4 blank lines at the top, they are not parts of the game map,
         * but they are used to see when pieces go out of the map */
        for(j = height; j < height + 4; j++)
        {
            sur = new Surface(blockWidth, blockHeight);
            block = new Sprite(blockWidth, blockHeight);
            sur.context.fillStyle = '#888888';
            sur.context.fillRect(0, 0, sur.width, sur.width);

            block.image = sur;
            block.x = sur.width * i + x;
            block.y = game.height - (j + 1) * sur.height + y;

            game.rootScene.addChild(block);
            surfaceMap[i + j * width] = sur;
        }
    }

    this.redraw = function(map, gray)
    {
        /* redraw the wall */
        var length = width * height;

        for(var i = 0; i < length; i++)
        {
            var sur = surfaceMap[i];

            if(map[i])
                sur.context.fillStyle = gray ? '#AAAAAA' : 'rgb(' + map[i] + ')';
            else
                sur.context.fillStyle = '#000000';

            sur.context.fillRect(1, 1, sur.width-2, sur.width-2);
        }

        for(i = length; i < length + 4 * width; i++)
        {
            sur = surfaceMap[i];
            sur.context.fillStyle = '#888888';
            sur.context.fillRect(0, 0, sur.width, sur.width);
        }
    }

    this.drawPiece = function(pieceType, x, y, rotate)
    {
        var piece = pieceType.rotated(rotate);

        /* draw the piece above it */
        for(var i = 0; i < piece.height; i++)
        {
            for(var j = 0; j < piece.width; j++)
            {
                var blockIndex = i * piece.width + j;
                var blockX = j + x;
                var blockY = i + y;
                var sur = surfaceMap[blockX + blockY * width];

                if(piece.mask[blockIndex] != 0 && sur != undefined)
                {
                    sur.context.fillStyle = "rgba(" + pieceType.color + ",0.7)";
                    sur.context.fillRect(1, 1, sur.width-2, sur.width-2);
                }
            }
        }
    }
}

window.onload = function()
{    
    engine = new GameEngine(config);

    var surfaceMap = new Array();
    var width = engine.width;
    var height = engine.height;
    var blockWidth = config['BlockWidth'];
    var blockHeight = config['BlockHeight']

    var gagnees = 0;
    var nulles = 0;
    var perdues = 0;

    var m_map;
    var m_piece;
    var m_rotate;
    var m_pieceX;
    var m_pieceY;
    var m_playing = false;

    /* two game displays : one for the player, one for the computer */
    var game = new Game(width*blockWidth*2 + 10, (height+4)*blockHeight, "container");
    var m_surface = new GameSurface(game, width, height, blockWidth, blockHeight, 0, 0);
    var computerSurface = new GameSurface(game, width, height, blockWidth, blockHeight, game.width - width*blockWidth, 0);
    computerController = new OptimalController(computerSurface);

    this.play = function(game, map, currentPieceType)
    {
        log("C'est votre tour.");

        m_map = map;
        m_piece = currentPieceType;
        m_rotate = 0;
        m_playing = true;

        m_pieceX = 0;
        m_pieceY = engine.placePiece(m_map, m_piece, new Action(m_pieceX, m_rotate), true)[1];

        onUpdate(m_map);
    }

    this.endGame = function(loosers, piece, coords, rotate)
    {
        /* cheesy hack : the "piece" parameter is the where he put the piece 
         * so that we can display it despite than it is not part of the map. 
         */
        m_surface.redraw(m_map, false);

        computerSurface.drawPiece(piece, coords[0], coords[1], rotate);

        m_playing = false;

        var message;
        if(loosers.length == 2)
        {
            message = "Match nul.\nRejouer ?";
            nulles += 1;
        }
        else if(loosers[0].controller == this)
        {
            message = "Désolé, vous avez perdu.\nRejouer ?";
            perdues += 1;
        }
        else
        {
            message = "Bravo, vous avez gagné.\nRejouer ?";
            gagnees += 1;
        }

        var total = gagnees + nulles + perdues;
        document.getElementById("gagnees").innerHTML = gagnees + "&nbsp;(" + Math.floor(gagnees/total * 100 + 0.5) + "%)";
        document.getElementById("nulles").innerHTML = nulles + "&nbsp;(" + Math.floor(nulles/total * 100 + 0.5) + "%)";
        document.getElementById("perdues").innerHTML = perdues + "&nbsp;(" + Math.floor(perdues/total * 100 + 0.5) + "%)";

        if(confirm(message))
            start();
        else
            game.stop();
    }

    this.onClick = function(column)
    {
        if(!m_playing)
            return;

        /* compute the block under the mouse */
        var coords = engine.placePiece(m_map, m_piece, new Action(column, m_rotate), true);

        m_pieceX = coords[0];
        m_pieceY = coords[1];

        onUpdate(m_map);
    }

    this.applyKey = function(event)
    {
        if(window.event) event = window.event;
        code = event.keyCode;
        shift = event.shiftKey;
        if(code == 73)
            onRotate(shift ? "left" : "");
        if(code == 74)
        {
            if(shift)
                onClick(0);
            else
                onClick(Math.max(0, m_pieceX-1));
        }
        else if(code == 75)
            onValidate();
        else if(code == 76)
        {
            if(shift)
                onClick(engine.width);
            else
                onClick(m_pieceX + 1);
        }
    }

    this.onMoveRight = function()
    {
        this.onClick(m_pieceX - 1);
    }

    this.onRotate = function(direction)
    {
        m_rotate = (direction == "left" ? m_rotate + 1 : m_rotate + 3) % m_piece.possibleStates;
        
        var coords = engine.placePiece(m_map, m_piece, new Action(m_pieceX, m_rotate), true);
        m_pieceX = coords[0];
        m_pieceY = coords[1];

        onUpdate(m_map);
    }

    this.onValidate = function()
    {
        if(m_playing)
        {
            m_playing = false;
            engine.userAction(new Action(m_pieceX, m_rotate), this);
        }
    }

    this.onUpdate = function(map)
    {
        m_surface.redraw(map);
        m_surface.drawPiece(m_piece, m_pieceX, m_pieceY, m_rotate);
    }

    this.start = function()
    {
        game.start();
        engine.reset();
        engine.start();   
    }

    document.onkeydown = this.applyKey;
    engine.addPlayer(this, m_surface);
    engine.addPlayer(computerController, computerSurface);
    start();
}
