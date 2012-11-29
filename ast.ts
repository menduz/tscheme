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
    } else if (exps[0] === 'define') {            // (define var exps)
        return new SDefine([
            new SStr(exps[0]),
            new SStr(exps[1]),
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'set!') {              // (set! var exps)
        return new SSet([
            new SStr(exps[0]),
            ast(exps[1]),
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'lambda') {            // (lambad (var1 var2 ...) exps)
        var variables: S[] = [];
        for (var i = 0; i < exps[1].length; ++i) {
            variables.push(new SStr(exps[1][i]));
        }
        return new SLambda([
            new SStr(exps[0]),
            variables,
            ast(exps[2]),
        ]);
    } else if (exps[0] === 'begin') {             // (begin (exp1) (exp2) ...)
        var begin = exps[0];
        var tmp = exps.slice(1);
        var expressions = [];
        for (var i = 0; i < tmp.length; ++i) {
            expressions.push(ast(tmp[i]));
        }
        return new SBegin([
            new SStr(begin),
            expressions,
        ]);
    } else {                                      // (proc exp1 exp2 ...)
        var expressions: any[] = [];
        for (var i = 0; i < exps.length; ++i) {
            var s: S = ast(exps[i]);
            expressions.push(s);
        }
        return new SProc(expressions);
    }
}
