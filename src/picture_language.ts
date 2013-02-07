// Picture language

/// <reference path="environment.ts"/>

//////////////////////////////////////////////////
// vector
//////////////////////////////////////////////////

interface Vector {
    x: number;
    y: number;
}

function makeVect(x: number, y: number): Vector {
    return {x: x, y: y};
}

function addVect(a: Vector, b: Vector): Vector {
    return makeVect(a.x + b.x, a.y + b.y);
}

function subVect(a: Vector, b: Vector): Vector {
    return makeVect(a.x - b.x, a.y - b.y);
}

function scaleVect(s: number, v: Vector): Vector{
    return makeVect(s * v.x, s * v.y);
}

//////////////////////////////////////////////////
// segment
//////////////////////////////////////////////////
interface Segment {
    start: Vector;
    end: Vector;
}

function makeSegment(start: Vector, end: Vector): Segment {
    return {start: start, end: end};
}

//////////////////////////////////////////////////
// frame
//////////////////////////////////////////////////
interface Frame {
    origin: Vector;
    edge1: Vector;
    edge2: Vector;
}

function makeFrame(origin: Vector, edge1: Vector, edge2: Vector): Frame {
    return {origin: origin, edge1: edge1, edge2: edge2};
}

// origin(frame) + x * edge1(frame) + y * edge2(frame)
function frameCoordMap(frame: Frame): (Vector) => Vector {
    return (v: Vector): Vector => addVect(frame.origin,
                                          addVect(
                                              scaleVect(v.x, frame.edge1),
                                              scaleVect(v.y, frame.edge2))
                                         );
}

function makeFullCanvasFrame(canvas: HTMLCanvasElement): Frame {
    return makeFrame(
        makeVect(0, 0),
        makeVect(canvas.clientWidth, 0),
        makeVect(0, canvas.clientHeight)
    );
}

////////////////////////////////////////////////
// draw segment
////////////////////////////////////////////////
function drawLine(context: any, start: Vector, end: Vector): void {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
}

function clearCanvas(context: any): void {
    context.clearRect(0, 0, context.width, context.height);
}

//////////////////////////////////////////////////
// painter
//////////////////////////////////////////////////
function segment2Painter(context: any, segments: Segment[]): (Frame) => void {
    return function(frame: Frame): void {
        for (var i = 0; i < segments.length; ++i) {
            drawLine(
                context,
                frameCoordMap(frame)(segments[i].start),
                frameCoordMap(frame)(segments[i].end)
            );
        }
    };
}

function image2Painter(context: any, img: any): (Frame) => void {
    return function(frame: Frame) {
        var w = img.width;
        var h = img.height;
        context.setTransform(
            frame.edge1.x / w,
            frame.edge1.y / h,
            frame.edge2.x / w,
            frame.edge2.y / h,
            frame.origin.x,
            frame.origin.y
        );
        context.drawImage(img, 0, 0);
        context.setTransform(1, 0, 0, 1, 0, 0);
    };
}

//////////////////////////////////////////////////
// operator
//////////////////////////////////////////////////
function transformPainter(painter: (Frame) => void, origin: Vector, corner1: Vector, corner2: Vector): (Frame) => void {
    return function(frame: Frame): void {
        var m: (Vector) => Vector = frameCoordMap(frame);
        var new_origin: Vector = m(origin);
        painter(
            makeFrame(
                new_origin,
                subVect(m(corner1), new_origin),
                subVect(m(corner2), new_origin)
            )
        );
    };
}

function flipVert(painter: (Frame) => void): (Frame) => void {
    return transformPainter(
        painter,
        makeVect(0, 1),
        makeVect(1, 1),
        makeVect(0, 0)
    );
}

function upperRight(painter: (Frame) => void): (Frame) => void {
    return transformPainter(
        painter,
        makeVect(0.5, 0),
        makeVect(1, 0),
        makeVect(0.5, 0.5)
    );
}

function downerRight(painter: (Frame) => void): (Frame) => void {
    return transformPainter(
        painter,
        makeVect(0.5, 0.5),
        makeVect(1, 0.5),
        makeVect(0.5, 1)
    );
}

function rotate90(painter: (Frame) => void): (Frame) => void {
    return transformPainter(
        painter,
        makeVect(1, 0),
        makeVect(1, 1),
        makeVect(0, 0)
    );
}

function squashInWards(painter: (Frame) => void): (Frame) => void {
    return transformPainter(
        painter,
        makeVect(0, 0),
        makeVect(0.65, 0.35),
        makeVect(0.35, 0.65)
    );
}

function beside(painter1: (Frame) => void, painter2: (Frame) => void): (Frame) => void {
    return (function(paintLeft: (Frame) => void, paintRight: (Frame) => void): (Frame) => void {
        return function(frame: Frame): void {
            paintLeft(frame);
            paintRight(frame);
        }
    })(transformPainter(painter1, makeVect(0, 0), makeVect(0.5, 0), makeVect(0, 1)),
       transformPainter(painter2, makeVect(0.5, 0), makeVect(1, 0), makeVect(0.5, 1)));
}

function below(painter1: (Frame) => void, painter2: (Frame) => void): (Frame) => void {
    return function(frame: Frame): void {
            transformPainter(
                painter2,
                makeVect(0, 0),
                makeVect(1, 0),
                makeVect(0, 0.5)
            )(frame);
            transformPainter(
                painter1,
                makeVect(0, 0.5),
                makeVect(1, 0.5),
                makeVect(0, 1)
            )(frame);
        };
}

function rightSplit(painter: (Frame) => void, n: number): (Frame) => void {
    if (n == 0) {
        return painter;
    } else {
        var smaller = rightSplit(painter, n - 1);
        return beside(painter, below(smaller, smaller));
    }
}

function addPictureFunction(env: Environment): void {
    var canvas: HTMLCanvasElement =
        <HTMLCanvasElement> document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var imgCat = document.getElementById('cat');
    var imgFromURL = document.getElementById('from_url');
    var f = makeFullCanvasFrame(canvas);
    env.update(
        ['draw',
         'cat',
         'from-url',
         'full-frame',
         'flip-vert',
         'rotate90',
         'beside',
         'below',
        ],
        [(painters) => painters[0](f),
         image2Painter(ctx, imgCat),                         // cat
         image2Painter(ctx, imgFromURL),                     // from-url
         makeFullCanvasFrame(canvas),                        // make-full-frame
         (painters) => flipVert(painters[0]),                // flip-vert
         (painters) => rotate90(painters[0]),                // rotate90
         (painters) => beside(painters[0], painters[1]),     // beside
         (painters) => below(painters[0], painters[1]),      // below
        ]
    );
}

//////////////////////////////////////////////////
// test
//////////////////////////////////////////////////
// window.onload = function () {
//     var canvas = <HTMLCanvasElement> document.getElementById("canvas");
//     var ctx = canvas.getContext("2d");
//     var img = document.getElementById('cat');
//     var painter = image2Painter(ctx, img);
//     var frame = makeFrame(
//         makeVect(0, 0),
//         makeVect(300, 0),
//         makeVect(0, 300)
//     );
//     // beside(painter, flipVert(painter))(frame);
//     flipVert(painter)(makeFullCanvasFrame(canvas));
//     // var t = rightSplit(painter, 3)(makeFullCanvasFrame(canvas));
// }
