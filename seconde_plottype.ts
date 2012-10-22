// Scheme interpreter by TypeScript

//////////////////////////////////////////////////
// S-expression
//////////////////////////////////////////////////

class S {
    // S-expression has 'expression'
    // ex) exp = ['lambda', 'x', 'x'] or [1] or ...
    
    constructor(public exp: any, public env: Environment) {
    }

    toString(): string {
        // return string of S-expression

        function innerToString(s: any): string {
            if (s instanceof Array) {
                return "(" + map(innerToString, s).join(" ") + ")";
            } else {
                return String(s);
            }
        }

        function map(f: (any) => string, list: any[]): string[] {
            var res: any[] = [];
            for (var i = 0; i < list.length; ++i) {
                res.push(f(list[i]));
            }
            return res;
        }

        return "(" + map(innerToString, this.exp).join(" ") + ")";
    }

    evaluate(): any {
        if (typeof this.exp === 'string') {
            return this.env.find(this.exp)[this.exp];
        } else if (! (this.exp instanceof Array)) {
            return this.exp;
        } else if (this.exp[0] === 'quote') {          // (quote exp)
            var sQuote: S = new SQuote(this.exp.slice(1), this.env);
            return sQuote.evaluate();
        } else if (this.exp[0] === 'if') {             // (if test conseq alt)
            var sIf: S = new SIf(this.exp.slice(1), this.env);
            return sIf.evaluate();
        } else if (this.exp[0] === 'define') {         // (define var exp)
            var sDefine: S = new SDefine(this.exp.slice(1), this.env);
            sDefine.evaluate();
        } else if (this.exp[0] === 'set!') {           // (set! var exp)
            var sSet: S = new SSet(this.exp.slice(1), this.env);
            sSet.evaluate();
        } else if (this.exp[0] === 'lambda') {         // (lambad (var*) exp)
            var sLambda: S = new SLambda(this.exp.slice(1), this.env);
            return sLambda.evaluate();
        } else if (this.exp[0] === 'begin') {          // (begin exp*)

        } else {                                       // (proc exp*)
            console.log('pass else');
            var exps: any[] = [];
            for (var i = 0; i < this.exp.length; ++i) {
                var s: S = new S(this.exp[i], this.env);
                exps.push(s.evaluate());
            }
            console.log('exps[0]: ' + exps[0]);       // proc
            console.log('exps[1]: ' + exps[1]);       // arg1
            console.log('exps[2]: ' + exps[2]);       // arg2
            var proc: (any) => any = exps.shift();
            console.log('exps[0]: ' + exps[0]);       // proc
            return proc(exps);
        }
    }
}

class SQuote extends S {
    // quote: (exp)

    constructor(exp: any[], env: Environment) {
        super(exp, env);
    }

    evaluate(): any[] {
        return this.exp;
    }
}

class SIf extends S {
    // if: (test conseq alt)

    constructor(exp: any[], env: Environment) {
        super(exp, env);
    }

    evaluate(): any {
        var test: S = new S(this.exp[0], this.env);
        if (test.evaluate()) {
            var conseq: S = new S(this.exp[1], this.env);
            return conseq.evaluate();
        } else {
            var alt: S = new S(this.exp[2], this.env);
            return alt.evaluate();
        }
    }
}

class SSet extends S {
    // set!: (var expression)

    constructor(exp: any[], env: Environment) {
        super(exp, env);
    }

    evaluate(): void {
        var s: S = new S(this.exp[1], this.env);
        this.env.find(this.exp[0])[this.exp[0]] = s.evaluate();
    }
}

class SDefine extends S {
    // define: (var exp)

    constructor(exp: any[], env: Environment) {
        super(exp, env);
    }

    evaluate(): void {
        var s: S = new S(this.exp[1], this.env);
        this.env.dict[this.exp[0]] = s.evaluate();
    }
}

class SLambda extends S {
    // lambda: ((var*) exp)

    constructor(exp: any[], env: Environment) {
        super(exp, env);
    }

    evaluate(): (any) => any {
        var newEnv: Environment = new Environment(this.env);
        var copy: SLambda = new SLambda(this.exp, this.env);
        return function (args: any) {
            newEnv.update(copy.exp[0], args);
            var s: S = new S(copy.exp[1], newEnv);
            return s.evaluate();
        }
    }
}

//////////////////////////////////////////////////
// Environment
//////////////////////////////////////////////////

class Environment {
    // Environment has 'dict' and 'outer'
    // dict: {'var': val}
    // outer: Environment

    dict: {[key: string]: any;} = {};

    constructor(public outer: Environment) {
    }

    update(variable: string[], values: any[]): void {
        if (variable.length === values.length) {
            for (var i = 0; i < variable.length; ++i) {
                this.dict[variable[i]] = values[i];
            }
        } else {
            // TODO
            // need to change
            alert("error: the number of variables isn't same as that of values");
        }
    }

    find(variable: string): {[variable: string]: any;} {
        if (variable in this.dict) {
            return this.dict;
        } else {
            // TODO
            // if outer is null, cause invisible error
            return this.outer.find(variable);
        }
    }
}

function createGlobalEnvironment(): Environment {
    // add global Environment to primitive procedures

    var env: Environment = new Environment(null);

    env.update(
        // TODO
        // add more
        ['cons',
         'car',
         'cdr',
         'eq?',
         '#t',
         '#f'],
        [function (x: any, y: any) {
            var list = [];
            list.push(x);
            list.push(y);
        },
         (x: any[]) => x[0],
         (x: any[]) => x.slice(1),
         (x: any[]) => x[0] === x[1],
         true,
         false,]
    );

    return env;
}

//////////////////////////////////////////////////
// parse
//////////////////////////////////////////////////

function parse(str: string, env: Environment): S {
    // read S-expression from string

    return new S(readFrom(tokenize(str)), env);
}

function tokenize(str: string): string[] {
    // convert string to list of tokens

    function replaceAll(expression: string, org: string, dest: string): string {
        return expression.split(org).join(dest);
    }
    
    str = replaceAll(str, "(", " ( ");
    str = replaceAll(str, ")", " ) ");

    var list: string[] = str.split(/\s+/);
    var res = [];
    for (var i = 0; i < list.length; ++i) {
        if (list[i] !== '') {
            res.push(list[i]);
        }
    }

    return res;
}

function readFrom(tokens: string[]): any[] {
    // read expression from list of tokens

    function innerReadFrom(tokens: string[]): any {
        if (tokens.length === 0) {
            alert("SyntaxError: unexpected EOF while reading");
        }

        var token: string = tokens.shift();

        if (token === "(") {
            var L: any[] = [];
            while (tokens[0] != ")") {
                L.push(readFrom(tokens));
            }
            tokens.shift();
            return L;
        } else if (token === ")") {
            alert("SyntaxError: unexpected )");
        } else {
            var isNotANumber: (string) => bool = isNaN;
            if (!isNotANumber(token)) {
                if (token.indexOf(".") != -1) {
                    return parseFloat(token);
                } else {
                    return parseInt(token);
                }
            } else {
                return token;
            }
        }
    }

    return innerReadFrom(tokens);
}

//////////////////////////////////////////////////
// test
//////////////////////////////////////////////////

var global: Environment = createGlobalEnvironment();

//////////
// pass test if
//////////

// var testif = '(if #t 1 0)';
// var stest = parse(testif, global);
// console.log(String(stest.evaluate()));

//////////
// pass test set!
//////////

// var testset = '(define a 1)';
// var stest = parse(testset, global);
// stest.evaluate();

// testset = '(set! a 1)';
// stest = parse(testset, global);
// stest.evaluate();
// var test = 'a';
// stest = parse(test, global);
// console.log(String(stest.evaluate()));

//////////
// pass test define
//////////

// var testset = '(define a 1)';
// var stest = parse(testset, global);
// stest.evaluate();
// var test = 'a';
// stest = parse(test, global);
// console.log(String(stest.evaluate()));

//////////
// test1 lambda
//////////

// var testset = '(define a (lambda (a) a))';
// var stest = parse(testset, global);
// stest.evaluate();
// var test = '(a 1)';
// stest = parse(test, global);
// console.log(String(stest.evaluate()));

//////////
// pass test2 lambda
//////////

// var testset = '(define a (lambda (x y) (eq? x y)))';
// var stest = parse(testset, global);
// stest.evaluate();
// var test = '(a 1 1)';
// stest = parse(test, global);
// console.log(String(stest.evaluate()));
