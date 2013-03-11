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
                sur.context.fillStyle = gray ? '#AAAAAA' : map[i];
            else
                sur.context.fillStyle = '#000000';

            sur.context.fillRect(0, 0, sur.width, sur.width);
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
                    sur.context.fillStyle = pieceType.color;
                    sur.context.fillRect(1, 1, sur.width - 2, sur.width - 2);
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

    var m_map;
    var m_piece;
    var m_rotate;
    var m_pieceX;
    var m_pieceY;
    var m_playing = false;

    /* two game displays : one for the player, one for the computer */
    var m_surface;
    
    computerSurface = undefined;
    computerController = new OptimalController();

    var game = new Game(width*blockWidth*2 + 10, (height+4)*blockHeight, "container");

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

    this.endGame = function(success, piece, coords, rotate)
    {
        /* cheesy hack : the "piece" parameter is the where he put the piece 
         * so that we can display it despite than it is not part of the map. 
         * Currenty we have only one player so if success is false, it is him. 
         * But one should find a better way to know "who" lost.
         */
        m_surface.redraw(m_map, false);

        if(success)
            computerSurface.drawPiece(piece, coords[0], coords[1], rotate);
        else
            m_surface.drawPiece(piece, coords[0], coords[1], rotate);

        m_playing = false;

        var message = success ? 
            'Félicitations, vous avez gagné !\n Rejouer ?' :
            'Désolé, vous avez perdu.\n Rejouer ?';

        if(confirm(message))
            start();
        else
            game.stop();
    }

    game.onload = function()
    {    
        m_surface = new GameSurface(game, width, height, blockWidth, blockHeight, 0, 0);

        var x = game.width - width*blockWidth;
        computerSurface = new GameSurface(game, width, height, blockWidth, blockHeight, x, 0);
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

    this.validate = function(map)
    {
        m_surface.redraw(map);
    }

    this.onUpdate = function(map)
    {
        m_surface.redraw(map);
        m_surface.drawPiece(m_piece, m_pieceX, m_pieceY, m_rotate);
    }

    this.otherPlayed = function(player, piece, coords, rotate)
    {
        if(player.controller == computerController)
        {
            computerSurface.drawPiece(m_piece, coords[0], coords[1], rotate);
        }
    }

    this.updateOther = function(player, map)
    {
        if(player.controller == computerController)
            computerSurface.redraw(map);
    }

    this.start = function()
    {
        game.start();
        engine.reset();
        engine.start();   
    }

    engine.addPlayer(this);
    engine.addPlayer(computerController);
    start();
}
