/**
 *
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 13-3-12 15:45
 * @description:
 */

var UglifyJS = require('uglify-js'),
    fs = require('fs'),
    _ = require('lodash');

module.exports = function(inputFile){
    if (!_.isString(inputFile)) return inputFile;

    var fileContent = '';
    if (fs.existsSync(inputFile)) {
        fileContent = fs.readFileSync(inputFile, 'utf-8');
    }

    try{
        return UglifyJS.parse(fileContent, {
            comments: true
        });
    }catch(e){
        e.message = 'file parse error. The file is ' + inputFile;
        e.detail = e.message;
        e.filePath = inputFile;
        throw new Error(e);
    }

};