const fs = require('fs');
const path = require('path');
/**
 * A formatting function for simple variable substitution.
 * For use when string interpolation cannot be used.
 * @author StackOverflow, Gabriel Nahmias
 * @see https://stackoverflow.com/a/18234317
 */
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

var loaded_templates = {}
/**
 * Evaluates a template object or string, subsituting in variables as appropriate.
 * @param String template The template String or template Object to use.
 */
this.evaluate_template = ( template, substitutions ) => {
    if( (typeof template)==(typeof "") ){
        return template.formatUnicorn( substitutions );
    } else if( (typeof template)==(typeof {}) ){
        if( loaded_templates[template["template"]] ){
            return loaded_templates[template["template"]].formatUnicorn( substitutions );
        } else {
            var template_path = path.join( ".", template["template"] );
            loaded_templates[template["template"]] = fs.readFileSync(template_path, {encoding: 'utf-8'});
            return loaded_templates[template["template"]].formatUnicorn( substitutions );
        }
    }
}