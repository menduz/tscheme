// Scheme interpreter by TypeScript

/// <reference path="environment.ts"/>

//////////////////////////////////////////////////
// S-expression
//////////////////////////////////////////////////

class S {
    // S is a super class
    // S stands for S-expression
    // S has 'expression'

    constructor(public exp: any) {
    }

    evaluate(env: Environment): any {
        // evaluate S-expression

        console.log('evaluate of super class S');
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

        if (this.exp instanceof Array) {
            return "(" + map(innerToString, this.exp).join(" ") + ")";
        } else {
            return String(this.exp);
        }
    }
}

class SSymbol extends S {
    // symbol

    constructor(exp: string) {
        super(exp);
    }

    evaluate(env: Environment): any {
        return env.find(this.exp)[this.exp];
    }
}

class SNum extends S {
    // number

    constructor(exp: number) {
        super(exp);
    }

    evaluate(env: Environment): number {
        return this.exp;
    }
}

class SStr extends S {
    // string

    constructor(exp: string) {
        super(exp);
    }

    evaluate(env: Environment): string {
        return this.exp;
    }
}

class SQuote extends S {
    // (quotation (value1 value2 ...))

    constructor(exp: any[]) {
        super(exp);
    }

    evaluate(env: Environment): any[] {
        return this.exp[1];
    }
}

class SIf extends S {
    // (if test conseq alt)

    constructor(exp: S[]) {
        super(exp);
    }

    evaluate(env: Environment): any {
        var test: S = this.exp[1];
        var conseq: S = this.exp[2];
        var alt: S = this.exp[3];
        if (test.evaluate(env)) {
            return conseq.evaluate(env);
        } else {
            return alt.evaluate(env);
        }
    }
}

class SSet extends S {
    // (set! variable expression)

    constructor(exp: S[]) {
        super(exp);
    }

    evaluate(env: Environment): void {
        var variable: string = this.exp[1].evaluate(env);
        var expression: S = this.exp[2];
        env.find(variable)[variable] = expression.evaluate(env);
    }
}

class SDefine extends S {
    // (define variable expression)

    constructor(exp: S[]) {
        super(exp);
    }

    evaluate(env: Environment): void {
        var variable: string = this.exp[1].evaluate(env);
        var expression: S = this.exp[2];
        env.dict[variable] = expression.evaluate(env);
    }
}

class SLambda extends S {
    // (lambda (var*) expression)
    // (lambda ((var*) (exp1) (exp2) ... )) =>
    //     (lambda ((var*) (begin (exp1) (exp2) ... )))

    constructor(exp: any[]) {
        super(exp);
    }

    evaluate(env: Environment): (any) => any {
        var newenv: Environment = new Environment(env);
        var variables: string[] = [];
        var expression: S = this.exp[2];
        for (var i = 0; i < this.exp[1].length; ++i) {
            variables.push(this.exp[1][i].evaluate(env));
        }
        return function (args: any) {
            newenv.update(variables, args);
            return expression.evaluate(newenv);
        }
    }
}

class SBegin extends S {
    // (being (exp1) (exp2) ... )

    constructor(exp: S[]) {
        super(exp);
    }

    evaluate(env: Environment): any {
        for (var i = 0; i < this.exp[1].length - 1; ++i) {
            this.exp[1][i].evaluate(env);
        }
        return this.exp[1][i].evaluate(env);
    }
}

class SProc extends S {
    // (proc args*)

    constructor(exp: S[]) {
        super(exp);
    }

    evaluate(env: Environment): any {
        var expressions: any[] = [];
        for (var i = 0; i < this.exp.length; ++i) {
            expressions.push(this.exp[i].evaluate(env));
        }
        var proc: (any) => any = expressions.shift();
        return proc(expressions);
    }
}
