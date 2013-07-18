var config = 
{
    'BlockWidth' : 45,
    'BlockHeight' : 45,
    'MapWidth' : 5,
    'MapHeight' : 5,
    'WindowBackground' : "#000000"
};

pieceTypes = new Array();

/* vertical bar */
pieceTypes[0] = new PieceType(new Array(
    new Piece(1, 4, [1, 1, 1, 1]),
    new Piece(4, 1, [1, 1, 1, 1])));

/* cube */
pieceTypes[1] = new PieceType(new Array(
    new Piece(2, 2, [1, 1, 1, 1])));

/* 'Z' */
pieceTypes[2] = new PieceType(new Array(
    new Piece(2, 3, [1, 0, 1, 1, 0, 1]),
    new Piece(3, 2, [0, 1, 1, 1, 1, 0])));

/* 'S' */
pieceTypes[3] = new PieceType(new Array(
    new Piece(2, 3, [0, 1, 1, 1, 1, 0]),
    new Piece(3, 2, [1, 1, 0, 0, 1, 1])));

/* 'T' */
pieceTypes[4] = new PieceType(new Array(
    new Piece(3, 2, [1, 1, 1, 0, 1, 0]),
    new Piece(2, 3, [0, 1, 1, 1, 0, 1]),
    new Piece(3, 2, [0, 1, 0, 1, 1, 1]),
    new Piece(2, 3, [1, 0, 1, 1, 1, 0])));

/* 'L' */
pieceTypes[5] = new PieceType(new Array(
    new Piece(2, 3, [0, 1, 0, 1, 1, 1]),
    new Piece(3, 2, [1, 0, 0, 1, 1, 1]),
    new Piece(2, 3, [1, 1, 1, 0, 1, 0]),
    new Piece(3, 2, [1, 1, 1, 0, 0, 1])));

pieceTypes[6] = new PieceType(new Array(
    new Piece(2, 3, [1, 0, 1, 0, 1, 1]),
    new Piece(3, 2, [1, 1, 1, 1, 0, 0]),
    new Piece(2, 3, [1, 1, 0, 1, 0, 1]),
    new Piece(3, 2, [0, 0, 1, 1, 1, 1])));

/* predifined colors */
colors = new Array( 
'#aa00aa',  /* vertical bar */
'#0000aa',  /* cube */
'#00aaaa',  /* 'Z' */
'#00aa00',  /* 'S' */
'#b24c33',  /* 'T' */
'#aa00aa',  /* 'L' */
'#cccccc'   /* 'L' */
);
colors = new Array( 
'170, 0, 0',  /* vertical bar */
'0, 0, 170',  /* cube */
'0, 170, 170',  /* 'Z' */
'0, 170, 0',  /* 'S' */
'178, 76, 51',  /* 'T' */
'170, 0, 170',  /* 'L' */
'204, 204, 204'   /* 'L' */
);
