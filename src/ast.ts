// Scheme interpreter by TypeScript

/// <reference path="s_expression.ts"/>

//////////////////////////////////////////////////
// ast
//////////////////////////////////////////////////

function ast(exps: any): S {
    // Return ast of Scheme from strings

    if (typeof exps === 'string') {
        return new SSymbol(exps);
    } else if (! (exps instanceof Array)) {
        return new SNum(exps);
    } else if (exps[0] === 'quote') {             // (quote (exp1 exp2 ...))
        return new SQuote([
            new SStr(exps[0]),
            exps[1],
        ]);
    } else if (exps[0] === 'if') {                // (if test conseq alt)
        return new SIf([
            new SStr(exps[0]),
            ast(exps[1]),
            ast(exps[2]),
            ast(exps[3]),
        ]);
    } else if (exps[0] === 'define') {
        if (exps[1] instanceof Array) {           // (define (name var) (exps))
            var variables: S[] = [];
            var expressions: S[] = [];
            var tmp_vars: any[] = exps[1].slice(1);
            var tmp_exps: any[] = exps.slice(2);
            for (var i = 0; i < tmp_vars.length; ++i) {
                variables.push(new SStr(tmp_vars[i]));
            }
            for (var i = 0; i < tmp_exps.length; ++i) {
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
        } else {                                  // (define var exp)
            return new SDefine([
                new SStr(exps[0]),
                new SStr(exps[1]),
                ast(exps[2]),
            ]);
        }
    } else if (exps[0] === 'set!') {              // (set! var exps)
        return new SSet([
            new SStr(exps[0]),
            ast(exps[1]),
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'lambda') {            // (lambad (vars) (exps))
        var variables: S[] = [];
        var expressions: any[] = [];
        var tmp: any[] = exps.slice(2);
        for (var i = 0; i < exps[1].length; ++i) {
            variables.push(new SStr(exps[1][i]));
        }
        for (var i = 0; i < tmp.length; ++i) {
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
    } else if (exps[0] === 'begin') {             // (begin (exps))
        var begin: string = exps[0];
        var tmp: any[] = exps.slice(1);
        var expressions: any[] = [];
        for (var i = 0; i < tmp.length; ++i) {
            expressions.push(ast(tmp[i]));
        }
        return new SBegin([
            new SStr(begin),
            expressions,
        ]);
    } else if (exps[0] === 'let') {               // (let ((vars values)) (exp))
        var let: string = 'lambda';               // => ((lambda (vars) (exp)) (values))
        var variables: S[] = [];
        var values: S[] = [];
        var expressions: any[] = [];
        var tmp: any[] = exps.slice(2);
        for (var i = 0; i < exps[1].length; ++i) {
            variables.push(new SStr(exps[1][i][0]));
            values.push(ast(exps[1][i][1]));
        }
        for (var i = 0; i < tmp.length; ++i) {
            expressions.push(ast(tmp[i]));
        }
        var slambda: S = new SLambda([
            new SStr(let),
            variables,
            new SBegin([
                new SStr("begin"),
                expressions,
            ]),
        ]);
        var proc: any[] = [slambda];
        for (var i = 0; i < values.length; ++i) {
            proc.push(values[i]);
        }
        return new SProc(proc);
    } else {                                      // (proc exp1 exp2 ...)
        var expressions: any[] = [];
        for (var i = 0; i < exps.length; ++i) {
            var s: S = ast(exps[i]);
            expressions.push(s);
        }
        return new SProc(expressions);
    }
}
