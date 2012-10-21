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
        if (variable.length == values.length) {
            for (var i = 0; i < variable.length; ++i) {
                this.dict[variable[i]] = values[i];
            }
        } else {
            // TODO
            // need to change
            alert("error: the number of variables is'nt same as that of values");
        }
    }

    find(variable: string) {
        if (variable in this.dict) {
            return this.dict;
        } else {
            // TODO
            // if outer is null, cause invisible error
            return this.outer.find(variable);
        }
    }
}

function createGlobalEnvironment() {
    // add global Environment to primitive procedures
    var env = new Environment(
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

function eval(x: any, env: Environment) {
    // evaluate exp in environment
    if (x instanceof String) {               // variable
        return env.find(x)[x];
    } else if (! x instanceof Array) {       // invariable
        return x;
    } else if (x[0] === 'quote') {           // (quote exp)
        var exp: string[] = x.slice(1);
        return exp;
    } else if (x[0] === 'if') {              // (if test conseq alt)
        var exp: string[] = x.slice(1);
        return exp;
    } else if (x[0] === 'set!') {            // (set! var exp)
        var variable: string = x[1];
        var exp: string = x[2];
        // TODO
        // warning, why?
        env.find(variable)[variable] = eval(exp, env);
    } else if (x[0] === 'define') {          // (define var exp)
        var variable: string = x[1];
        var exp: any = x[2];
        env.dict[variable] = eval(exp, env);
    } else if (x[0] === 'lambda') {          // (lambad (var*) exp)
        var variables: string = x[1];
        var exp: string = x[2];
        return (args: any[]) =>
            eval(exp, new Environment({}, env).update(variables, args));
    } else {                                 // (proc exp*)
        var exps: any[] = [];
        for (var i = 0; i < x.length; ++i) {
            exps.push(eval(x[i], env));
        }
        var proc = exps.shift();
        return proc(exps);
    }
}

//////////////////////////////////////////////////
// parse
//////////////////////////////////////////////////

function parse(s: string) {
    // read S-expression from string
    return read_from(tokenize(s));
}

function tokenize(s: string) {
    // convert string to list of tokens
    function replaceAll(expression, org, dest) {
        return expression.split(org).join(dest);
    }
    s = replaceAll(s, "(", " ( ");
    s = replaceAll(s, ")", " ) ");
    var list = s.split(" ");
    list.pop(); list.shift();
    return list;
}

function read_from(tokens: string[]) {
    // read expression from list of tokens
    if (tokens.length == 0) {
        alert("SyntaxError: unexpected EOF while reading");
    }
    var token: string = tokens.shift();
    if (token == "(") {
        var L: string[] = [];
        while (tokens[0] != ")") {
            L.push(read_from(tokens));
        }
        tokens.shift();
        return L;
    } else if (token == ")") {
        alert("SyntaxError: unexpected )");
    } else {
        return atom(token);
    }
}

function atom(token: string) {
    // if string return string else return symbol
    if (!isNaN(token)) {
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

function toString(exp) {
    // return converted S-expression
    function map(f, list: any[]) {
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

//////////////////////////////////////////////////
// test
//////////////////////////////////////////////////
var global = createGlobalEnvironment();
var test = "(define a 1)";
var list = parse(test);
// eval(parse(test), global);
// alert(eval('a', global));
var def = ['define', 'a', 1];
eval(def, global);
alert(eval('a', global));
// eval(parse(test), global);
// alert(String(eval('a', global)));
