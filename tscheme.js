var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var S = (function () {
    function S(exp, env) {
        this.exp = exp;
        this.env = env;
    }
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
        return "(" + map(innerToString, this.exp).join(" ") + ")";
    };
    S.prototype.evaluate = function () {
        if(typeof this.exp === 'string') {
            return this.env.find(this.exp)[this.exp];
        } else {
            if(!(this.exp instanceof Array)) {
                return this.exp;
            } else {
                if(this.exp[0] === 'quote') {
                    var sQuote = new SQuote(this.exp[1], this.env);
                    return sQuote.evaluate();
                } else {
                    if(this.exp[0] === 'if') {
                        var sIf = new SIf(this.exp.slice(1), this.env);
                        return sIf.evaluate();
                    } else {
                        if(this.exp[0] === 'define') {
                            var sDefine = new SDefine(this.exp.slice(1), this.env);
                            sDefine.evaluate();
                        } else {
                            if(this.exp[0] === 'set!') {
                                var sSet = new SSet(this.exp.slice(1), this.env);
                                sSet.evaluate();
                            } else {
                                if(this.exp[0] === 'lambda') {
                                    var sLambda = new SLambda(this.exp.slice(1), this.env);
                                    return sLambda.evaluate();
                                } else {
                                    if(this.exp[0] === 'begin') {
                                        var sBegin = new SBegin(this.exp.slice(1), this.env);
                                        return sBegin.evaluate();
                                    } else {
                                        var exps = [];
                                        for(var i = 0; i < this.exp.length; ++i) {
                                            var s = new S(this.exp[i], this.env);
                                            exps.push(s.evaluate());
                                        }
                                        var proc = exps.shift();
                                        return proc(exps);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
    return S;
})();
var SQuote = (function (_super) {
    __extends(SQuote, _super);
    function SQuote(exp, env) {
        _super.call(this, exp, env);
    }
    SQuote.prototype.evaluate = function () {
        return this.exp;
    };
    return SQuote;
})(S);
var SIf = (function (_super) {
    __extends(SIf, _super);
    function SIf(exp, env) {
        _super.call(this, exp, env);
    }
    SIf.prototype.evaluate = function () {
        var test = new S(this.exp[0], this.env);
        if(test.evaluate()) {
            var conseq = new S(this.exp[1], this.env);
            return conseq.evaluate();
        } else {
            var alt = new S(this.exp[2], this.env);
            return alt.evaluate();
        }
    };
    return SIf;
})(S);
var SSet = (function (_super) {
    __extends(SSet, _super);
    function SSet(exp, env) {
        _super.call(this, exp, env);
    }
    SSet.prototype.evaluate = function () {
        var s = new S(this.exp[1], this.env);
        this.env.find(this.exp[0])[this.exp[0]] = s.evaluate();
    };
    return SSet;
})(S);
var SDefine = (function (_super) {
    __extends(SDefine, _super);
    function SDefine(exp, env) {
        _super.call(this, exp, env);
    }
    SDefine.prototype.evaluate = function () {
        var s = new S(this.exp[1], this.env);
        this.env.dict[this.exp[0]] = s.evaluate();
    };
    return SDefine;
})(S);
var SLambda = (function (_super) {
    __extends(SLambda, _super);
    function SLambda(exp, env) {
        _super.call(this, exp, env);
    }
    SLambda.prototype.evaluate = function () {
        var newEnv = new Environment(this.env);
        var copy = new SLambda(this.exp, this.env);
        return function (args) {
            newEnv.update(copy.exp[0], args);
            var s = new S(copy.exp[1], newEnv);
            return s.evaluate();
        }
    };
    return SLambda;
})(S);
var SBegin = (function (_super) {
    __extends(SBegin, _super);
    function SBegin(exp, env) {
        _super.call(this, exp, env);
    }
    SBegin.prototype.evaluate = function () {
        var val;
        for(var i = 0; i < this.exp.length; ++i) {
            var s = new S(this.exp[i], this.env);
            val = s.evaluate();
        }
        return val;
    };
    return SBegin;
})(S);
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
            return this.outer.find(variable);
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
        'view', 
        
    ], [
        function (x) {
            var list = [];
            for(var i = 0; i < x.length; ++i) {
                if(x[i] instanceof Array) {
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
            var res = 0;
            for(var i = 0; i < args.length; ++i) {
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
        function () {
            var img = document.createElement("img");
            document.body.appendChild(img);
            img.src = 'roriyuri.jpg';
        }, 
        
    ]);
    return env;
}
function parse(str, env) {
    return new S(readFrom(tokenize(str)), env);
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
var global = createGlobalEnvironment();
