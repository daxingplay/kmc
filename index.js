/**
 *
 * @author: 橘子<daxingplay@gmail.com>
 * @time: 13-3-12 11:41
 * @description:
 */

var Compiler = require('./lib/compiler');

module.exports = {
    config: function(cfg){
        this.config = cfg;
    },
    analyze: function(inputFile){
        var self = this;
        var c = new Compiler(self.config);
        return c.analyze(inputFile);
    }
};