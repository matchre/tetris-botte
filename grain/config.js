var config = 
{
    'BlockWidth' : 20,
    'BlockHeight' : 20,
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
colors = new Array( '#AA0000', '#00AA00', '#0000AA', '#AAAA00', '#00AAAA', '#AA00AA' );