var Environment = (function () {
    function Environment(outer) {
        this.outer = outer;
        this.dict = {
        };
    }
    Environment.prototype.update = function (variable, values) {
        if(variable.length === values.length) {
            for(var i = 0; i < variable.length; ++i) {
                this.dict[variable[i]] = values[i];
            }
        } else {
            console.log("error: the number of variables isn't same as that of values");
        }
    };
    Environment.prototype.find = function (variable) {
        if(variable in this.dict) {
            return this.dict;
        } else {
            if(this.outer === null) {
                console.log("error: the variable not found");
            } else {
                return this.outer.find(variable);
            }
        }
    };
    return Environment;
})();
function createGlobalEnvironment() {
    var env = new Environment(null);
    env.update([
        'cons', 
        'car', 
        'cdr', 
        'eq?', 
        'null?', 
        '#t', 
        '#f', 
        '+', 
        '-', 
        '*', 
        '/', 
        '>', 
        '<', 
        
    ], [
        function (x) {
            var list = [];
            for(var i = 0; i < x.length; ++i) {
                if(i === x.length - 1 && x[i] instanceof Array) {
                    for(var j = 0; j < x[i].length; ++j) {
                        list.push(x[i][j]);
                    }
                } else {
                    list.push(x[i]);
                }
            }
            return list;
        }, 
        function (x) {
            return x[0][0];
        }, 
        function (x) {
            return x[0].slice(1);
        }, 
        function (x) {
            return x[0] === x[1];
        }, 
        function (x) {
            return x[0].length === 0;
        }, 
        true, 
        false, 
        function (args) {
            var res = 0;
            for(var i = 0; i < args.length; ++i) {
                res += args[i];
            }
            return res;
        }, 
        function (args) {
            var res = args[0];
            for(var i = 1; i < args.length; ++i) {
                res -= args[i];
            }
            return res;
        }, 
        function (args) {
            var res = 1;
            for(var i = 0; i < args.length; ++i) {
                res *= args[i];
            }
            return res;
        }, 
        function (args) {
            var res = args[0];
            for(var i = 1; i < args.length; ++i) {
                res /= args[i];
            }
            return res;
        }, 
        function (x) {
            return x[0] > x[1];
        }, 
        function (x) {
            return x[0] < x[1];
        }, 
        
    ]);
    return env;
}
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var S = (function () {
    function S(exp) {
        this.exp = exp;
    }
    S.prototype.evaluate = function (env) {
        console.log('evaluate of super class S');
    };
    S.prototype.sleep = function (milliseconds) {
        var start = new Date().getTime();
        for(var i = 0; i < 10000000; i++) {
            if((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    };
    S.prototype.toString = function () {
        function innerToString(s) {
            if(s instanceof Array) {
                return "(" + map(innerToString, s).join(" ") + ")";
            } else {
                return String(s);
            }
        }
        function map(f, list) {
            var res = [];
            for(var i = 0; i < list.length; ++i) {
                res.push(f(list[i]));
            }
            return res;
        }
        if(this.exp instanceof Array) {
            return "(" + map(innerToString, this.exp).join(" ") + ")";
        } else {
            return String(this.exp);
        }
    };
    return S;
})();
var SSymbol = (function (_super) {
    __extends(SSymbol, _super);
    function SSymbol(exp) {
        _super.call(this, exp);
    }
    SSymbol.prototype.evaluate = function (env) {
        return env.find(this.exp)[this.exp];
    };
    return SSymbol;
})(S);
var SNum = (function (_super) {
    __extends(SNum, _super);
    function SNum(exp) {
        _super.call(this, exp);
    }
    SNum.prototype.evaluate = function (env) {
        return this.exp;
    };
    return SNum;
})(S);
var SStr = (function (_super) {
    __extends(SStr, _super);
    function SStr(exp) {
        _super.call(this, exp);
    }
    SStr.prototype.evaluate = function (env) {
        return this.exp;
    };
    return SStr;
})(S);
var SQuote = (function (_super) {
    __extends(SQuote, _super);
    function SQuote(exp) {
        _super.call(this, exp);
    }
    SQuote.prototype.evaluate = function (env) {
        return this.exp[1];
    };
    return SQuote;
})(S);
var SIf = (function (_super) {
    __extends(SIf, _super);
    function SIf(exp) {
        _super.call(this, exp);
    }
    SIf.prototype.evaluate = function (env) {
        var test = this.exp[1];
        var conseq = this.exp[2];
        var alt = this.exp[3];
        if(test.evaluate(env)) {
            return conseq.evaluate(env);
        } else {
            return alt.evaluate(env);
        }
    };
    return SIf;
})(S);
var SSet = (function (_super) {
    __extends(SSet, _super);
    function SSet(exp) {
        _super.call(this, exp);
    }
    SSet.prototype.evaluate = function (env) {
        var variable = this.exp[1].evaluate(env);
        var expression = this.exp[2];
        env.find(variable)[variable] = expression.evaluate(env);
    };
    return SSet;
})(S);
var SDefine = (function (_super) {
    __extends(SDefine, _super);
    function SDefine(exp) {
        _super.call(this, exp);
    }
    SDefine.prototype.evaluate = function (env) {
        var variable = this.exp[1].evaluate(env);
        var expression = this.exp[2];
        env.dict[variable] = expression.evaluate(env);
    };
    return SDefine;
})(S);
var SLambda = (function (_super) {
    __extends(SLambda, _super);
    function SLambda(exp) {
        _super.call(this, exp);
    }
    SLambda.prototype.evaluate = function (env) {
        var newenv = new Environment(env);
        var variables = [];
        var expression = this.exp[2];
        for(var i = 0; i < this.exp[1].length; ++i) {
            variables.push(this.exp[1][i].evaluate(env));
        }
        return function (args) {
            newenv.update(variables, args);
            return expression.evaluate(newenv);
        }
    };
    return SLambda;
})(S);
var SBegin = (function (_super) {
    __extends(SBegin, _super);
    function SBegin(exp) {
        _super.call(this, exp);
    }
    SBegin.prototype.evaluate = function (env) {
        for(var i = 0; i < this.exp[1].length - 1; ++i) {
            this.exp[1][i].evaluate(env);
        }
        return this.exp[1][i].evaluate(env);
    };
    return SBegin;
})(S);
var SProc = (function (_super) {
    __extends(SProc, _super);
    function SProc(exp) {
        _super.call(this, exp);
    }
    SProc.prototype.evaluate = function (env) {
        var expressions = [];
        for(var i = 0; i < this.exp.length; ++i) {
            expressions.push(this.exp[i].evaluate(env));
        }
        var proc = expressions.shift();
        return proc(expressions);
    };
    return SProc;
})(S);
function ast(exps) {
    if(typeof exps === 'string') {
        return new SSymbol(exps);
    } else {
        if(!(exps instanceof Array)) {
            return new SNum(exps);
        } else {
            if(exps[0] === 'quote') {
                return new SQuote([
                    new SStr(exps[0]), 
                    exps[1], 
                    
                ]);
            } else {
                if(exps[0] === 'if') {
                    return new SIf([
                        new SStr(exps[0]), 
                        ast(exps[1]), 
                        ast(exps[2]), 
                        ast(exps[3]), 
                        
                    ]);
                } else {
                    if(exps[0] === 'define') {
                        if(exps[1] instanceof Array) {
                            var variables = [];
                            var expressions = [];
                            var tmp_vars = exps[1].slice(1);
                            var tmp_exps = exps.slice(2);
                            for(var i = 0; i < tmp_vars.length; ++i) {
                                variables.push(new SStr(tmp_vars[i]));
                            }
                            for(var i = 0; i < tmp_exps.length; ++i) {
                                expressions.push(ast(tmp_exps[i]));
                            }
                            return new SDefine([
                                new SStr(exps[0]), 
                                new SStr(exps[1][0]), 
                                new SLambda([
                                    new SStr("lambda"), 
                                    variables, 
                                    new SBegin([
                                        new SStr("begin"), 
                                        expressions, 
                                        
                                    ]), 
                                    
                                ]), 
                                
                            ]);
                        } else {
                            return new SDefine([
                                new SStr(exps[0]), 
                                new SStr(exps[1]), 
                                ast(exps[2]), 
                                
                            ]);
                        }
                    } else {
                        if(exps[0] === 'set!') {
                            return new SSet([
                                new SStr(exps[0]), 
                                ast(exps[1]), 
                                ast(exps[2]), 
                                
                            ]);
                        } else {
                            if(exps[0] === 'lambda') {
                                var variables = [];
                                var expressions = [];
                                var tmp = exps.slice(2);
                                for(var i = 0; i < exps[1].length; ++i) {
                                    variables.push(new SStr(exps[1][i]));
                                }
                                for(var i = 0; i < tmp.length; ++i) {
                                    expressions.push(ast(tmp[i]));
                                }
                                return new SLambda([
                                    new SStr(exps[0]), 
                                    variables, 
                                    new SBegin([
                                        new SStr("begin"), 
                                        expressions, 
                                        
                                    ]), 
                                    
                                ]);
                            } else {
                                if(exps[0] === 'begin') {
                                    var begin = exps[0];
                                    var tmp = exps.slice(1);
                                    var expressions = [];
                                    for(var i = 0; i < tmp.length; ++i) {
                                        expressions.push(ast(tmp[i]));
                                    }
                                    return new SBegin([
                                        new SStr(begin), 
                                        expressions, 
                                        
                                    ]);
                                } else {
                                    if(exps[0] === 'let') {
                                        var let = 'lambda';
                                        var variables = [];
                                        var values = [];
                                        var expressions = [];
                                        var tmp = exps.slice(2);
                                        for(var i = 0; i < exps[1].length; ++i) {
                                            variables.push(new SStr(exps[1][i][0]));
                                            values.push(ast(exps[1][i][1]));
                                        }
                                        for(var i = 0; i < tmp.length; ++i) {
                                            expressions.push(ast(tmp[i]));
                                        }
                                        var slambda = new SLambda([
                                            new SStr(let), 
                                            variables, 
                                            new SBegin([
                                                new SStr("begin"), 
                                                expressions, 
                                                
                                            ]), 
                                            
                                        ]);
                                        var proc = [
                                            slambda
                                        ];
                                        for(var i = 0; i < values.length; ++i) {
                                            proc.push(values[i]);
                                        }
                                        return new SProc(proc);
                                    } else {
                                        var expressions = [];
                                        for(var i = 0; i < exps.length; ++i) {
                                            var s = ast(exps[i]);
                                            expressions.push(s);
                                        }
                                        return new SProc(expressions);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
function parse(str) {
    return readFrom(tokenize(str));
}
function tokenize(str) {
    function replaceAll(expression, org, dest) {
        return expression.split(org).join(dest);
    }
    str = replaceAll(str, "(", " ( ");
    str = replaceAll(str, ")", " ) ");
    var list = str.split(/\s+/);
    var res = [];
    for(var i = 0; i < list.length; ++i) {
        if(list[i] !== '') {
            res.push(list[i]);
        }
    }
    return res;
}
function readFrom(tokens) {
    function innerReadFrom(tokens) {
        if(tokens.length === 0) {
            console.log("SyntaxError: unexpected EOF while reading");
        }
        var token = tokens.shift();
        if(token === "(") {
            var L = [];
            while(tokens[0] != ")") {
                L.push(readFrom(tokens));
            }
            tokens.shift();
            return L;
        } else {
            if(token === ")") {
                console.log("SyntaxError: unexpected )");
            } else {
                var isNotANumber = isNaN;
                if(!isNotANumber(token)) {
                    if(token.indexOf(".") != -1) {
                        return parseFloat(token);
                    } else {
                        return parseInt(token);
                    }
                } else {
                    return token;
                }
            }
        }
    }
    return innerReadFrom(tokens);
}
function makeVect(x, y) {
    return {
        x: x,
        y: y
    };
}
function addVect(a, b) {
    return makeVect(a.x + b.x, a.y + b.y);
}
function subVect(a, b) {
    return makeVect(a.x - b.x, a.y - b.y);
}
function scaleVect(s, v) {
    return makeVect(s * v.x, s * v.y);
}
function makeSegment(start, end) {
    return {
        start: start,
        end: end
    };
}
function makeFrame(origin, edge1, edge2) {
    return {
        origin: origin,
        edge1: edge1,
        edge2: edge2
    };
}
function frameCoordMap(frame) {
    return function (v) {
        return addVect(frame.origin, addVect(scaleVect(v.x, frame.edge1), scaleVect(v.y, frame.edge2)));
    }
}
function makeFullCanvasFrame(canvas) {
    return makeFrame(makeVect(0, 0), makeVect(canvas.clientWidth, 0), makeVect(0, canvas.clientHeight));
}
function drawLine(context, start, end) {
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
}
function clearCanvas(context) {
    context.clearRect(0, 0, context.width, context.height);
}
function segment2Painter(context, segments) {
    return function (frame) {
        for(var i = 0; i < segments.length; ++i) {
            drawLine(context, frameCoordMap(frame)(segments[i].start), frameCoordMap(frame)(segments[i].end));
        }
    }
}
function image2Painter(context, img) {
    return function (frame) {
        var w = img.width;
        var h = img.height;
        context.setTransform(frame.edge1.x / w, frame.edge1.y / h, frame.edge2.x / w, frame.edge2.y / h, frame.origin.x, frame.origin.y);
        context.drawImage(img, 0, 0);
        context.setTransform(1, 0, 0, 1, 0, 0);
    }
}
function transformPainter(painter, origin, corner1, corner2) {
    return function (frame) {
        var m = frameCoordMap(frame);
        var new_origin = m(origin);
        painter(makeFrame(new_origin, subVect(m(corner1), new_origin), subVect(m(corner2), new_origin)));
    }
}
function flipVert(painter) {
    return transformPainter(painter, makeVect(0, 1), makeVect(1, 1), makeVect(0, 0));
}
function upperRight(painter) {
    return transformPainter(painter, makeVect(0.5, 0), makeVect(1, 0), makeVect(0.5, 0.5));
}
function downerRight(painter) {
    return transformPainter(painter, makeVect(0.5, 0.5), makeVect(1, 0.5), makeVect(0.5, 1));
}
function rotate90(painter) {
    return transformPainter(painter, makeVect(1, 0), makeVect(1, 1), makeVect(0, 0));
}
function squashInWards(painter) {
    return transformPainter(painter, makeVect(0, 0), makeVect(0.65, 0.35), makeVect(0.35, 0.65));
}
function beside(painter1, painter2) {
    return (function (paintLeft, paintRight) {
        return function (frame) {
            paintLeft(frame);
            paintRight(frame);
        }
    })(transformPainter(painter1, makeVect(0, 0), makeVect(0.5, 0), makeVect(0, 1)), transformPainter(painter2, makeVect(0.5, 0), makeVect(1, 0), makeVect(0.5, 1)));
}
function below(painter1, painter2) {
    return function (frame) {
        transformPainter(painter2, makeVect(0, 0), makeVect(1, 0), makeVect(0, 0.5))(frame);
        transformPainter(painter1, makeVect(0, 0.5), makeVect(1, 0.5), makeVect(0, 1))(frame);
    }
}
function rightSplit(painter, n) {
    if(n == 0) {
        return painter;
    } else {
        var smaller = rightSplit(painter, n - 1);
        return beside(painter, below(smaller, smaller));
    }
}
function addPictureFunction(env) {
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');
    var imgCat = document.getElementById('cat');
    var imgFromURL = document.getElementById('from_url');
    var f = makeFullCanvasFrame(canvas);
    env.update([
        'draw', 
        'cat', 
        'from-url', 
        'full-frame', 
        'flip-vert', 
        'rotate90', 
        'beside', 
        'below', 
        
    ], [
        function (painters) {
            return painters[0](f);
        }, 
        image2Painter(ctx, imgCat), 
        image2Painter(ctx, imgFromURL), 
        makeFullCanvasFrame(canvas), 
        function (painters) {
            return flipVert(painters[0]);
        }, 
        function (painters) {
            return rotate90(painters[0]);
        }, 
        function (painters) {
            return beside(painters[0], painters[1]);
        }, 
        function (painters) {
            return below(painters[0], painters[1]);
        }, 
        
    ]);
}
