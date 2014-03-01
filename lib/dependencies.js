/**
 *
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 13-3-12 15:45
 * @description:
 */

"use strict";

var fs = require('fs');
var UglifyJS = require('uglify-js'),
    getAst = require('./get-ast'),
    colors = require('colors');

var commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
    requireRegExp = /[^.'"]\s*require\s*\(([^)]+)\)/g;

function getRequireVal(str) {
    var m;
    // simple string
    if (!(m = str.match(/^\s*["']([^'"\s]+)["']\s*$/))) {
        return null;
    }
    return  m[1];
}

module.exports = {
    getRequiresFromFn: function(inputFile, debug){
        var content = fs.readFileSync(inputFile).toString();
        var requires = [];
        content
            .replace(commentRegExp, '')
            .replace(requireRegExp, function (match, dep) {
                var requiredVal = getRequireVal(dep);
                if(requiredVal === null){
                    debug && console.log(('[Warning] can not find required mod in require call: ' + dep + '. The file is ' + inputFile).yellow);
                }else{
                    requires.push(requiredVal);
                }
            });
        return requires;
    },
    requires: function(inputFile){
        var ast = getAst(inputFile);

        var deps = [],
            moduleName = undefined,
            call_expression = null,
            obj_expression = null;

        if(ast){
            var walker = new UglifyJS.TreeWalker(function(node, descend) {
                if(node instanceof UglifyJS.AST_Call && (node.start.value == 'KISSY' || node.start.value == 'S') && node.expression && node.expression.property == 'add'){

                    if(walker.find_parent(UglifyJS.AST_Call)){
                        var PASS = walker.stack.some(function(iNode){
                           return (
                               iNode !== node &&
                               iNode instanceof UglifyJS.AST_Call &&
                               (iNode.start.value == 'KISSY' || iNode.start.value == 'S') &&
                               iNode.expression && iNode.expression.property == 'add'
                           );
                        });
                        if(PASS){
                            return true;
                        }
                    }

                    var tmp = call_expression;
                    call_expression = node;
                    descend();
                    call_expression = tmp;
                    return true;
                }

//                if(node instanceof UglifyJS.AST_String && call_expression && obj_expression === null){
//                    moduleName = node.getValue();
//            console.log('Found Module ID: ' + moduleName);
//                }

                if(node instanceof UglifyJS.AST_Lambda && call_expression){
                    var tmp = call_expression;
                    call_expression = null;
                    descend();
                    call_expression = tmp;
//            console.log('Found Lambda');
                    return true;
                }

                if(node instanceof UglifyJS.AST_ObjectKeyVal && call_expression && obj_expression === null){
                    if(node.key && node.key === 'requires'){
//                console.log('Found requires');
                        var tmp = obj_expression;
                        obj_expression = node;
                        descend();
                        obj_expression = null;
                        return true;
                    }
                }

                if(node instanceof UglifyJS.AST_String && call_expression && obj_expression){
                    var mod = node.getValue();
                    deps.push(mod);
//            console.log('Found required module: ' + mod);
                }

            });

            ast.walk(walker);
        }

        return moduleName ? { name: moduleName, deps: deps } :deps;
    }
};