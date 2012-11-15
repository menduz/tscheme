// Scheme interpreter by TypeScript

//////////////////////////////////////////////////
// Environment
//////////////////////////////////////////////////

export class Environment {
    // Environment has 'dict' and 'outer'
    // dict: {'var': val}
    // outer: Environment

    dict: {[key: string]: any;} = {};

    constructor(public outer: Environment) {
    }

    update(variable: string[], values: any[]): void {
        // update environment

        if (variable.length === values.length) {
            for (var i = 0; i < variable.length; ++i) {
                this.dict[variable[i]] = values[i];
            }
        } else {
            console.log("error: the number of variables isn't same as that of values");
        }
    }

    find(variable: string): {[variable: string]: any;} {
        // find a variable in the current environment.
        // if the current environment has it, return outer.

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

export function createGlobalEnvironment(): Environment {
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
        ],

        [function (x: any[]): any[] {             // cons
            var list = [];
            for (var i = 0; i < x.length; ++i) {
                if (i === x.length - 1 && x[i] instanceof Array) {
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
        ]
    );

    return env;
}
