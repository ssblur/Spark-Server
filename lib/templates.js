const fs = require('fs');
const path = require('path');
/**
 * A formatting function for simple variable substitution.
 * For use when string interpolation cannot be used.
 * @author StackOverflow, Gabriel Nahmias
 * @see https://stackoverflow.com/a/18234317
 */
function formatUnicorn(str, ...varArgs) {
  let out;
  if (arguments.length) {
    const t = typeof varArgs[0];
    let key;
    const args = (t === 'string' || t === 'number')
      ? Array.prototype.slice.call(varArgs)
      : varArgs[0];

    for (let i = 0; i < args.length; i += 1) {
      key = args[i];
      out = str.replace(new RegExp(`\\{${key}\\}`, 'gi'), args[key]);
    }
  }

  return out;
}

const loadedTemplates = {};
/**
 * Evaluates a template object or string, subsituting in variables as appropriate.
 * @param String template The template String or template Object to use.
 */
this.evaluateTemplate = (template, substitutions) => {
  if ((typeof template) === 'string') {
    return formatUnicorn(template, substitutions);
  } if ((typeof template) === (typeof {})) {
    if (loadedTemplates[template.template]) {
      return formatUnicorn(loadedTemplates[template.template], substitutions);
    }
    const templatePath = path.join('.', template.template);
    loadedTemplates[template.template] = fs.readFileSync(templatePath, { encoding: 'utf-8' });
    return formatUnicorn(loadedTemplates[template.template], substitutions);
  }
  return template;
};
