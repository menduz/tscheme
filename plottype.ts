// Scheme interpreter by TypeScript
// reference: http://norvig.com/lispy.html

//////////////////////////////////////////////////
// Environment model
//////////////////////////////////////////////////

class Environment {
    // Environment has 'dict' and 'outEnvironment'
    // dict: {'var': val}
    // outEnvironment: Environment
    constructor(public dict: {[string]: any;}, public outer: Environment) {
    }

    update(variable: string[], values: any[]) {
        if (variable.length === values.length) {
            for (var i = 0; i < variable.length; ++i) {
                this.dict[variable[i]] = values[i];
            }
        } else {
            // TODO
            // need to change
            alert("error: the number of variables is'nt same as that of values");
        }
    }

    find(variable: string): any {
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
    var env: Environment = new Environment(
        // TODO
        // add more
        {'car': (x: any[]) => x[0], 'cdr': (x: any[]) => x.slice(1),
        },
        null
    );
    return env;
}

//////////////////////////////////////////////////
// eval
//////////////////////////////////////////////////

function eval(x: any, env: Environment): any {
    // evaluate exp in environment
    if (typeof x === 'string') {               // variable
        return env.find(x)[x];
    } else if (!(x instanceof Array)) {       // invariable
        return x;
    } else if (x[0] === 'quote') {           // (quote exp)
        var exp: string[] = x.slice(1);
        return exp;
    } else if (x[0] === 'if') {              // (if test conseq alt)
        var test: any = x[1];
        var conseq: any = x[2];
        var alt: any = x[3];
        // TODO: causing message
        if (eval(test, env)) {
            return eval(conseq, env);
        } else {
            return eval(alt, env);
        }
    } else if (x[0] === 'set!') {            // (set! var exp)
        var variable: string = x[1];
        var exp: any = x[2];
        env.find(variable)[variable] = eval(exp, env);
    } else if (x[0] === 'define') {          // (define var exp)
        var variable: string = x[1];
        var exp: any = x[2];
        env.dict[variable] = eval(exp, env);
    } else if (x[0] === 'lambda') {          // (lambad (var*) exp)
        var variables: any[] = x[1];
        var exp: any = x[2];
        var newEnv: Environment = new Environment({}, env);
        return function (args: any[]): any {
            newEnv.update(variables, args);
            eval(exp, newEnv);
        }
    } else if (x[0] === 'begin') {          // (begin exp*)
        var val: any;
        for (var i = 1; i < x.length; ++i) {
            val = eval(x[i], env);
        }
        return val;
    } else {                                 // (proc exp*)
        var exps: any[] = [];
        for (var i = 0; i < x.length; ++i) {
            exps.push(eval(x[i], env));
        }
        var proc: any = exps.shift();
        return proc(exps);
    }
}

//////////////////////////////////////////////////
// parse
//////////////////////////////////////////////////

function parse(s: string): string[] {
    // read S-expression from string
    return read_from(tokenize(s));
}

function tokenize(s: string): string[] {
    // convert string to list of tokens
    function replaceAll(expression: string, org: string, dest: string) {
        return expression.split(org).join(dest);
    }
    s = replaceAll(s, "(", " ( ");
    s = replaceAll(s, ")", " ) ");
    var list: string[] = s.split(/\s+/);
    list.pop(); list.shift();
    return list;
}

function read_from(tokens: string[]): string[] {
    // read expression from list of tokens
    if (tokens.length === 0) {
        alert("SyntaxError: unexpected EOF while reading");
    }
    var token: string = tokens.shift();
    console.log(token);
    if (token === "(") {
        var L: any[] = [];
        while (tokens[0] != ")") {
            L.push(read_from(tokens));
        }
        tokens.shift();
        return L;
    } else if (token === ")") {
        alert("SyntaxError: unexpected )");
    } else {
        return atom(token);
    }
}

function atom(token: string): any {
    // if string return string else return symbol
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

//////////////////////////////////////////////////
// output
//////////////////////////////////////////////////

function toString(exp: any): string {
    // return converted S-expression
    function map(f: (any) => string, list: any[]): string[] {
        var res: any[] = [];
        for (var i = 0; i < list.length; ++i) {
            res.push(f(list[i]));
        }
        return res;
    }
    if (exp instanceof Array) {
        return "(" + map(toString, exp).join(" ") + ")";
    } else {
        return String(exp);
    }
}

var test = "(define a 10.1)";
var res: string = toString(parse(test));
alert(res);

//////////////////////////////////////////////////
// test
//////////////////////////////////////////////////
var global: Environment = createGlobalEnvironment();
var test: string = '(define a (lambda (x) x))';
// var test: string = '(define a 1)';
eval(parse(test), global);
var testf: string = '(a 1)'
alert(String(eval(parse(testf), global)));
