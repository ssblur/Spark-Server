const fs = require('fs');
const path = require('path');
/**
 * A formatting function for simple variable substitution.
 * For use when string interpolation cannot be used.
 * @author StackOverflow, Gabriel Nahmias
 * @see https://stackoverflow.com/a/18234317
 */
function formatUnicorn(str, args) {
  let out = str;
  {
    let key;
    for (let i = 0; i < Object.keys(args).length; i += 1) {
      key = Object.keys(args)[i];
      out = out.replace(new RegExp(`\\{${key}\\}`, 'gi'), args[key]);
    }
  }

  return out;
}

this.loadedTemplates = {};
/**
 * Evaluates a template object or string, subsituting in variables as appropriate.
 * @param String template The template String or template Object to use.
 */
this.evaluateTemplate = (template, substitutions) => {
  if ((typeof template) === 'string') {
    return formatUnicorn(template, substitutions);
  } if ((typeof template) === (typeof {})) {
    if (this.loadedTemplates[template.template]) {
      return formatUnicorn(this.loadedTemplates[template.template], substitutions);
    }
    const templatePath = path.join('.', template.template);
    this.loadedTemplates[template.template] = fs.readFileSync(templatePath, { encoding: 'utf-8' });
    return formatUnicorn(this.loadedTemplates[template.template], substitutions);
  }
  return template;
};
