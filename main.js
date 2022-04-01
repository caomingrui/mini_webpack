const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const option = require('./mypack.config');
const {transformFromAst} = require("@babel/core");
const traverse = require('@babel/traverse').default;
const t = require('@babel/types')


const Parser = {
    getAst: path => {
        const content = fs.readFileSync(path, 'utf-8');

        const source = parser.parse(content, {
            sourceType: 'module'
        });

        console.log(content, source);
        return source;
    },

    getDeclaration: (ast, filename) => {
        const dependecies = {};

        traverse(ast, {
            CallExpression (p) {
                console.log(p);
            },

            // 类型为 ImportDeclaration 的AST 节点 为 import 语句
            ImportDeclaration({node}) {
                const dirname = path.dirname(filename);

                const filepath = './' + path.join(dirname, node.source.value);
                dependecies[node.source.value] = node.source.value + '.js'
            },

            // 字符串字面量
            StringLiteral({node}) {
                // node.value = '12312312';
            },

            ExpressionStatement: testFn
        });
        return dependecies;
    },

    getCode: (ast) => {
        const {code} = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        });
        return code;
    }
};


function testFn (path) {
    const {node} = path;

    if (node.expression.callee.name === 'jj') {
        path.replaceWith(
            t.callExpression(
                t.memberExpression(t.identifier('console'), t.identifier('log')),
                // t.arguments(path.node.expression.arguments),
                // path.node.elements
                path.node.expression.arguments
            )
        )
    }
}


class Compiler {
    constructor(option) {
        const { entry, output } = option;

        this.entry = entry;

        this.output = output;

        this.modules = [];
    }

    run () {
        const info = this.build(this.entry);
        this.modules.push(info);
        // this.modules.forEach(({ dependecies }) => {
        //     if (dependecies) {
        //         for (const dependency in dependecies) {
        //             this.modules.push(this.build(dependecies[dependency]))
        //         }
        //     }
        // });

        // 生成依赖关系
        const dependencyGraph = this.modules.reduce((graph, item) => {
            const obj = {
                ...graph,
                [item.filename]: {
                    dependecies: item.dependecies,
                    code: item.code
                }
            };
            return obj;
        }, {});

        this.generate(dependencyGraph);
    }

    build (filename) {
        const {getAst, getCode, getDeclaration} = Parser;
        const ast = getAst(filename);
        const dependecies = getDeclaration(ast, filename);
        const code = getCode(ast);
        // 递归依赖
        if (Object.keys(dependecies).length) {
            for (const dependency in dependecies) {
                this.modules.push(this.build(dependecies[dependency]));
                console.log(this.modules)
            }
        }

        return {
            filename,
            dependecies,
            code
        };
    }

    // 重写require 函数, 输出 bundle
    generate (code) {

        const filePath = path.join(this.output.path, this.output.filename);

        const bundle = `(function (graph) {
            function require (module) {
                function localRequire (relativePath) {
                    return require(graph[module].dependecies[relativePath])
                }
            
                const exports = {};
                console.log(module)
                (function (require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);
                
                return exports;
            }

            require('${this.entry}');
        })(${JSON.stringify(code)})`;

        fs.writeFileSync(filePath, bundle, 'utf-8')
    }
};

const myPack = new Compiler(option);
myPack.run();