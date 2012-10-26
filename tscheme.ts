// Scheme interpreter by TypeScript
// reference: http://norvig.com/lispy.html

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
            var sQuote: S = new SQuote(this.exp[1], this.env);
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
            var sBegin: S = new SBegin(this.exp.slice(1), this.env);
            return sBegin.evaluate();
        } else {                                       // (proc exp*)
            var exps: any[] = [];
            for (var i = 0; i < this.exp.length; ++i) {
                var s: S = new S(this.exp[i], this.env);
                exps.push(s.evaluate());
            }
            var proc: (any) => any = exps.shift();
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
    // (lambda ((var*) exp1 exp2 ... )) =>
    //     (lambda ((var*) (begin (exp1) (exp2) ... )))

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

class SBegin extends S {
    // being: ((exp1) (exp2) ... )

    constructor(exp: any[], env: Environment) {
        super(exp, env);
    }

    evaluate(): any {
        var val: any;
        for (var i = 0; i < this.exp.length; ++i) {
            var s: S = new S(this.exp[i], this.env);
            val = s.evaluate();
        }
        return val;
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
            console.log("error: the number of variables isn't same as that of values");
        }
    }

    find(variable: string): {[variable: string]: any;} {
        if (variable in this.dict) {
            return this.dict;
        } else {
            if (this.outer === null) {
                console.log("error: the variable not found")
            } else {
                return this.outer.find(variable);
            }
        }
    }
}


// for HTMLElement.src
interface HTMLElement {
    src: string;
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
        ],

        [function (x: any[]): any[] {             // cons
            var list = [];
            for (var i = 0; i < x.length; ++i) {
                if (x[i] instanceof Array) {
                    for (var j = 0; j < x[i].length; ++j) {
                        list.push(x[i][j]);
                    }
                } else {
                    list.push(x[i]);
                }
            }
            return list;
        },
         (x: any[]): any => x[0][0],              // car
         (x: any[]): any[] => x[0].slice(1),      // cdr
         (x: any[]): bool => x[0] === x[1],       // eq?
         (x: any[]): bool => x[0].length === 0,   // null?
         true,                                    // #t
         false,                                   // #f
         function (args: number[]): number {      // '+'
             var res = 0;
             for (var i = 0; i < args.length; ++i) {
                 res += args[i];
             }
             return res;
         },
         function (args: number[]): number {      // '-'
             var res = 0;
             for (var i = 0; i < args.length; ++i) {
                 res -= args[i];
             }
             return res;
         },
         function (args: number[]): number {      // '*'
             var res = 1;
             for (var i = 0; i < args.length; ++i) {
                 res *= args[i];
             }
             return res;
         },
         function (args: number[]): number {      // '/'
             var res = args[0];
             for (var i = 1; i < args.length; ++i) {
                 res /= args[i];
             }
             return res;
         },
         (x: any[]): bool => x[0] > x[1],         // '>'
         (x: any[]): bool => x[0] < x[1],         // '<'
         // function (filename: string): void {   // view
         //     var img = document.createElement("img");
         //     document.body.appendChild(img);
         //     img.src = filename;
         // },
         function (): void {                      // view
             var img = document.createElement("img");
             document.body.appendChild(img);
             img.src = 'blackcat.jpg';
         },
        ]
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
            console.log("SyntaxError: unexpected EOF while reading");
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
            console.log("SyntaxError: unexpected )");
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
// pass test1 lambda
//////////

// var testset = '(define a (lambda (a) a))';
// var stest = parse(testset, global);
// stest.evaluate();
// var test = '(a 1)';
// stest = parse(test, global);
// console.log(String(stest.evaluate()));

//////////
// pass test2 define(scope)
//////////

// var a = '(define a 1)';
// var b = '(define b 2)'
// var pa = parse(a, global);
// pa.evaluate();
// var pb = parse(b, global);
// pb.evaluate();
// var testa = 'a';
// var testb = 'b';
// pa = parse(testa, global);
// console.log(String(pa.evaluate()));
// pb = parse(testb, global);
// console.log(String(pb.evaluate()));

//////////
// pass test2 lambda
//////////

// var testset = '(define a (lambda (x y) (eq? x y)))';
// var stest = parse(testset, global);
// stest.evaluate();
// var test = '(a 1 1)';
// stest = parse(test, global);
// console.log(String(stest.evaluate()));

//////////
// pass test3 lambda(fact & iter)
//////////

// var iter= '(define iter (lambda (k n res) (if (> k n) res (iter (+ k 1) n (* k res)))))'
// var factorial = '(define factorial (lambda (n) (iter 1 n 1)))'
// var test = parse(iter, global);
// test.evaluate();
// test = parse(factorial, global);
// test.evaluate();
// var tfactorial = '(factorial 5)'
// test = parse(tfactorial, global);
// console.log(String(test.evaluate()));

//////////
// pass test4 lambda
//////////

// var factorial = '(define factorial (lambda (n) (begin (define iter (lambda (k res) (if (> k n) res (iter (+ k 1) (* k res))))) (iter 1 1))))'
// var test = parse(factorial, global);
// test.evaluate();
// var tfactorial = '(factorial 5)'
// test = parse(tfactorial, global);
// console.log(String(test.evaluate()));

//////////
// pass test3 define(nest)
//////////

// var a = '(define a (lambda () (begin (define b 1) b)))';
// var pa = parse(a, global);
// pa.evaluate();
// var testa = '(a)';
// pa = parse(testa, global);
// console.log(String(pa.evaluate()));

//////////
// pass test begin
//////////

// var a = '(begin (+ 1 1) (* 1 2))';
// var pa = parse(a, global);
// console.log(String(pa.evaluate()));

//////////
// pass test cons
//////////

// var a = '(cons (car (cons 1 2)) (cdr (cons 3 4)))';
// var pa = parse(a, global);
// console.log(String(pa.evaluate()));

//////////
// pass test car
//////////

// var a = '(car (quote (1 2 3 4)))'
// var pa = parse(a, global);
// console.log(String(pa.evaluate()));

//////////
// pass test cdr
//////////

// var a = '(cdr (quote (1 2 3 4)))'
// var pa = parse(a, global);
// console.log(String(pa.evaluate()));

//////////
// pass test fib
//////////

// var a = '(define fib (lambda (n) (begin (define iter (lambda (a b k) (begin (if (> k n) a (iter b (+ b a) (+ k 1)))))) (iter 0 1 1))))'
// var pa = parse(a, global);
// pa.evaluate();
// var b = '(fib 8)';
// pa = parse(b, global);
// console.log(String(pa.evaluate()));

//////////
// pass test view
//////////

// var a = '(view)';
// var pa = parse(a, global);
// pa.evaluate();

//////////
// pass test null?
//////////

// var c = '(define c (cdr (cdr (cons 1 2))))';
// var pc = parse(c, global);
// pc.evaluate();
// var tmp = 'c';
// var ptmp = parse(tmp, global);
// console.log(ptmp.evaluate());
// var a = '(null? c)';
// var pa = parse(a, global);
// console.log(pa.evaluate());

//////////
// pass test nested cons
//////////

// var a = '(cons 1 (cons 2 (cons 3 4)))'
// var pa = parse(a, global);
// console.log(pa.evaluate());
