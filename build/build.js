(function (graph) {
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

            require('./index.js');
        })({"src/tool.js":{"dependecies":{},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.fn = void 0;\n//\nvar data = {};\n\nvar fn = function fn() {\n  var getVal = function getVal(key) {\n    return data[key];\n  };\n\n  var setVal = function setVal(key, value) {\n    if (!key) return;\n    return data[key] = value;\n  };\n\n  return {\n    getVal: getVal,\n    setVal: setVal\n  };\n};\n\nexports.fn = fn;"},"./src/ademo.js":{"dependecies":{"src/tool":"src/tool.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _tool = require(\"src/tool\");\n\nvar _default = function _default() {\n  var _fn = (0, _tool.fn)(),\n      getVal = _fn.getVal;\n\n  var val = getVal('a');\n  return val;\n};\n\nexports[\"default\"] = _default;"},"./src/bdemo.js":{"dependecies":{"src/tool":"src/tool.js"},"code":"\"use strict\";\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports[\"default\"] = void 0;\n\nvar _tool = require(\"src/tool\");\n\nvar _default = function _default() {\n  var _fn = (0, _tool.fn)(),\n      setVal = _fn.setVal;\n\n  var data = setVal('a', '1');\n  return data;\n};\n\nexports[\"default\"] = _default;"},"./index.js":{"dependecies":{"./src/ademo":"./src/ademo.js","./src/bdemo":"./src/bdemo.js"},"code":"\"use strict\";\n\nvar _ademo = _interopRequireDefault(require(\"./src/ademo\"));\n\nvar _bdemo = _interopRequireDefault(require(\"./src/bdemo\"));\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { \"default\": obj }; }\n\n(0, _ademo[\"default\"])();\n(0, _bdemo[\"default\"])();\nvar test = '我是测试用例';\nconsole.log(test, '1111111111111');\nconsole.log(123456);"}})