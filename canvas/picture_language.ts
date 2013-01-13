// Picture language

//////////////////////////////////////////////////
// vector
//////////////////////////////////////////////////

function makeVect(x, y) {
    return {x: x, y: y};
}

function addVect(a, b) {
    return makeVect(a.x + b.x, a.y + b.y);
}

function subVect(a, b) {
    return makeVect(a.x - b.x, a.y - b.y);
}

function scaleVect(s, v){
    return makeVect(s * v.x, s * v.y);
}

//////////////////////////////////////////////////
// segment
//////////////////////////////////////////////////
function makeSegment(start, end) {
    return {start: start, end: end};
}

//////////////////////////////////////////////////
// frame
//////////////////////////////////////////////////
function makeFrame(origin, edge1, edge2) {
    return {origin: origin, edge1: edge1, edge2: edge2};
}

// origin(frame) + x * edge1(frame) + y * edge2(frame) 
function frameCoordMap(frame){
    return function(v){
        return addVect(
                frame.origin,
                addVect(
                    scaleVect(v.x, frame.edge1),
                    scaleVect(v.y, frame.edge2))
        );
    };
}

function makeFullCanvasFrame(canvas) {
    return makeFrame(
        makeVect(0, 0),
        makeVect(canvas.clientWidth, 0),
        makeVect(0, canvas.clientHeight)
    );
}

////////////////////////////////////////////////
// draw segment
////////////////////////////////////////////////
function drawLine(context, start, end) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
}

function clearCanvas(context) {
    context.clearRect(0, 0, context.width, context.height);
}

//////////////////////////////////////////////////
// painter
//////////////////////////////////////////////////
function segment2Painter(context, segments) {
    return function(frame) {
        for (var i = 0; i < segments.length; ++i) {
            drawLine(
                context,
                frameCoordMap(frame)(segments[i].start),
                frameCoordMap(frame)(segments[i].end)
            );
        }
    };
}

function image2Painter(context, img) {
    return function(frame) {
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
function transformPainter(painter, origin, corner1, corner2) {
    return function(frame) {
        var m = frameCoordMap(frame);
        var new_origin = m(origin);
        painter(
            makeFrame(
                new_origin,
                subVect(m(corner1), new_origin),
                subVect(m(corner2), new_origin)
            )
        );
    };
}

function flipVert(painter) {
    return transformPainter(
        painter,
        makeVect(0, 1),
        makeVect(1, 1),
        makeVect(0, 0)
    );
}

function upperRight(painter) {
    return transformPainter(
        painter,
        makeVect(0.5, 0),
        makeVect(1, 0),
        makeVect(0.5, 0.5)
    );
}

function downerRight(painter) {
    return transformPainter(
        painter,
        makeVect(0.5, 0.5),
        makeVect(1, 0.5),
        makeVect(0.5, 1)
    );
}

function rotate90(painter) {
    return transformPainter(
        painter,
        makeVect(1, 0),
        makeVect(1, 1),
        makeVect(0, 0)
    );
}

function squashInWards(painter) {
    return transformPainter(
        painter,
        makeVect(0, 0),
        makeVect(0.65, 0.35),
        makeVect(0.35, 0.65)
    );
}

function beside(painter1, painter2) {
    return (function(paintLeft, paintRight) {
        return function(frame) {
            paintLeft(frame);
            paintRight(frame);
        }
    })(transformPainter(painter1,
                        makeVect(0, 0),
                        makeVect(0.5, 0),
                        makeVect(0, 1)),
       transformPainter(painter2,
                        makeVect(0.5, 0),
                        makeVect(1, 0),
                        makeVect(0.5, 1)));
}

function below(painter1, painter2) {
        return function(frame) {
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

var env: Environment = createGlobalEnvironment();
env.update(
    ['cat',
     'flip-vert',
     'rotate90',
     'beside',
     'below',
    ],
    [(function () {         // cat
        var canvas: HTMLCanvasElement =
            <HTMLCanvasElement> document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var img = document.getElementById('cat');
        image2Painter(ctx, img);
    })(),
     flipVert,              // flip-vert
     rotate90,              // rotate90
     beside,                // beside
     below,                 // below
    ]
);
