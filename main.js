const fs = require('fs');
const path = require('path');
const http = require("http");
const events = require('events');
const parser = require('@babel/parser');
const option = require('./mypack.config');
const {transformFromAst} = require("@babel/core");
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

const eventEmitter = new events.EventEmitter();

// route 根路径
eventEmitter.on('/', function(method, response){
    const filepath = path.resolve(__dirname, './build/index.html');
    fs.readFile(filepath, (err, data) => {
        response.writeHead(200, {'Content-Type': 'text/html;charset=utf8'});
        response.end(data);
    });
});

eventEmitter.on('/build.js', function(method, response){
    const filepath = path.resolve(__dirname, './build/build.js');
    fs.readFile(filepath, (err, data) => {
        response.writeHead(200, {'Content-Type': 'application/x-javascript;charset=utf8'});
        response.end(data);
    });
});

// route 404
eventEmitter.on('404', function(method, url, response){
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.end('404 Not Found\n');
});


const Parser = {
    getAst: (path, rules) => {
        let content = fs.readFileSync(path, 'utf-8');
        const option = {
            rules
        }
        Object.keys(rules).forEach((item) => {
            // const reg = new RegExp(`/\${item}$/`, `g`);

            if (path.search(item) !== -1) {
                const dn = require(rules[item]);
                content = dn.call(option, content);
            }
            else {
                content = fs.readFileSync(path, 'utf-8')
            }
        });

        const source = parser.parse(content, {
            sourceType: 'module'
        });

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
                dependecies[node.source.value] = node.source.value;
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
    // 测试 将 jj() -> console.log
    if (node.expression.callee.name === 'jj') {
        path.replaceWith(
            t.callExpression(
                t.memberExpression(t.identifier('console'), t.identifier('log')),
                path.node.expression.arguments
            )
        );
    }
}


class Compiler {
    constructor(option) {
        const { entry, output, module, port } = option;

        this.entry = entry;

        this.output = output;

        this.rules = module.rules.reduce((rulesObj, item) => {
            rulesObj[item.test] = item.loader;
            return rulesObj;
        }, {});

        this.modules = [];


        this.port = port;
    }

    run () {
        const info = this.build(this.entry);
        this.modules.push(info);

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
        const {getAst, getCode, getDeclaration, getRulesAst} = Parser;

        const ast = getAst(filename, this.rules);
        const dependecies = getDeclaration(ast, filename);
        const code = getCode(ast);
        // 递归依赖
        if (Object.keys(dependecies).length) {
            for (const dependency in dependecies) {
                this.modules.push(this.build(dependecies[dependency]));
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
                console.log(module);
                (function (require, exports, code) {
                    eval(code);
                })(localRequire, exports, graph[module].code);
                
                return exports;
            }

            require('${this.entry}');
        })(${JSON.stringify(code)})`;

        fs.writeFileSync(filePath, bundle, 'utf-8');
        console.log(`服务启动成功 http://localhost:${this.port}/`);
        if (this.port) {
            // 启动服务
            http.createServer(function (request, response) {
                // 分发
                if (eventEmitter.listenerCount(request.url) > 0){
                    eventEmitter.emit(request.url, request.method, response);
                }
                else {
                    eventEmitter.emit('404', request.method, request.url, response);
                }
            }).listen(this.port);
        }
    }
};

const myPack = new Compiler(option);
myPack.run();