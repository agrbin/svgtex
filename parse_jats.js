// Usage:
//
//   var parse_jats = require('./parse_jats').parse_jats;
//   ...
//   var formulas = parse_jats("...");
//
// This function parses an entire JATS file, and returns an array of objects that looks
// like this:
//
//   [{id: 'M1', format: 'latex', style: 'display', q: 'n^2'}, {...}]
//
// If there's an error, then it will instead return a simple string error message
//
// For debugging inside a web browser, use parse_jats.html, and invoke the function
// with, for example:
// 
//   jats='Formulas: <tex-math id="M1">n^2</tex-math> and <math id="M2"><mi>B</mi></math> etc.';
//   exports.parse_jats(jats);



// Regex to match the starting tag of any formula in a JATS file
var outer_stag_regexp = new RegExp(
    '<\\s*((disp-formula)|(inline-formula)|(math)|(mml:math)|(tex-math))(>|\\s.*?>)');

// Same start-tag regex as above, but without disp-formula or inline-formula, and 
// anchored to the beginning of the string.
var inner_stag_regexp = new RegExp('^<\\s*((math)|(mml:math)|(tex-math))(>|\\s.*?>)');


// This function parses a single JATS XML formula.  The outermost element might be 'disp-formula',
// 'inline-formula', 'mml:math', 'math', or 'tex-math'. It returns an object like
// {id: 'M1', format: 'latex', style: 'display', q: 'n^2'}
var parse_outer_formula = function(elem_name, xml) {
  var latex_style = (elem_name == "disp-formula") ? 'display' : 'text';
  var formula_xml = 
    (elem_name == 'disp-formula' || elem_name == 'inline-formula')
      ? strip_formula_wrap(xml)
      : xml;

  var pf = parse_formula(formula_xml);
  if (typeof pf === "string") return pf;  // error

  return {
    id: pf.id,
    format: pf.format,
    latex_style: latex_style,
    q: pf.q
  }

}

var strip_formula_wrap = function(xml) {
  return "<tex-math id='M1'>n^2</tex_math>";
}

// This finishes the parsing job.  It returns an object like
// {id: 'M1', format: 'latex', q: 'n^2'} (everything except 'style')
var parse_formula = function(xml) {
  var stag_match = inner_stag_regexp.exec(xml);
  if (!stag_match) return "Bad JATS formula, no start tag";

  var format = stag_match[1] == 'tex-math' ? 'latex' : 'mml';

  // Get the contents.  For mml, the contents include the start and end tags. For
  // latex, not.
  var q = xml;
  var stag_length = stag_match[0].length;
  if (format == 'latex') {
    var etag_regex = new RegExp('</\\s*tex-math\\s*>');
    var etag_match = etag_regex.exec(q);
    q = xml.substr(stag_length, etag_match.index - stag_length);
  }

  // FIXME: still need:
  // - extract the id

  return {
    id: 'M1',
    format: format,
    q: q
  }
}

// The main function, that will be exported
var parse_jats = function(jats) {

  // Need to find multiple equations in JATS file
  var formulas = [];

  while (stag_match = outer_stag_regexp.exec(jats)) {
    var stag = stag_match[0];
    var elem_name = stag_match[1];
    jats = jats.substr(stag_match.index + stag.length);

    var etag_regex = new RegExp('</\\s*' + elem_name + '\\s*>');
    var etag_match = etag_regex.exec(jats);
    if (!etag_match) {
      query.status_code = 400;
      query.error = "Bad JATS file; missing closing tag " + elem_name;
      return query;
    }
    var etag = etag_match[0];
    var xml = stag + jats.substr(0, etag_match.index) + etag;
    jats = jats.substr(etag_match.index + etag.length);

    var formula = parse_outer_formula(elem_name, xml);
    if (typeof formula === "string") return formula;  // error
    formulas.push(formula);
  }

  if (formulas.length == 0) {return "No formulas found";}
  return formulas;
}

// Here's the one and only exported function
if (typeof exports === "undefined") { exports = {}; }
exports.parse_jats = parse_jats;
