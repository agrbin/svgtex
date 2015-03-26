// Usage:
//
//   var parse_jats = require('./parse_jats').parse_jats;
//   ...
//   var formulas = parse_jats("...");
//
// This function parses an entire JATS file, and returns an array of objects that looks
// like this:
//
//   [{id: 'M1', format: 'latex', latex_style: 'display', q: 'n^2'}, {...}]
//
// If there's an error, then it will instead return a simple string error message
//
// For debugging inside a web browser, use parse_jats.html, and invoke the function
// with, for example:
// 
//   jats='Formulas: <tex-math id="M1">n^2</tex-math> and <math id="M2"><mi>B</mi></math> etc.';
//   exports.parse_jats(jats);



// Precompile regular expressions

// Regex to match the starting tag of any formula in a JATS file
// Note here we're using the [\s\S] trick to get the "dotall" modifier (in Perl, the `s`
// modifier) in JavaScript.  See http://stackoverflow.com/questions/1068280
var outer_stag_regexp = new RegExp(
    '<\\s*((disp-formula)|(inline-formula)|(math)|(mml:math)|(tex-math))(>|\\s[\\s\\S]*?>)');

// Same start-tag regex as above, but without disp-formula or inline-formula. Also, 
// designed to allow us to throw away whatever came *before* the start tag.
// After this matches: 
//   0 - Everything before and including the start tag
//   1 - Everything before the start tag
//   2 - The complete start tag
//   3 - The element name
var inner_stag_regexp = 
  new RegExp('^([\\s\\S]*?)(<\\s*((math)|(mml:math)|(tex-math))(>|(\\s[\\s\\S]*?>)))');

// Regular expressions for some ending tags
var etag_regexps = {
  'disp-formula': new RegExp('</\\s*disp-formula\\s*>'),
  'inline-formula': new RegExp('</\\s*inline-formula\\s*>'),
  'tex-math': new RegExp('</\\s*tex-math\\s*>')
}

// For the id attribute (matched against the entire start tag)
var id_regexp = new RegExp('\\s+id\\s*=\\s*("|\')(.*?)("|\')');


// This function parses a single JATS XML formula.
// The outermost element might be 'disp-formula',
// 'inline-formula', 'mml:math', 'math', or 'tex-math'. It returns an object like
// {id: 'M1', format: 'latex', style: 'display', q: 'n^2'}
var parse_outer_formula = function(stag, elem_name, xml) {
  var latex_style = (elem_name == "disp-formula") ? 'display' : 'text';
  var formula_xml = 
    (elem_name == 'disp-formula' || elem_name == 'inline-formula')
      ? strip_formula_wrap(stag, elem_name, xml)
      : xml;
  //return "stag = '" + stag + "', elem_name = '" + elem_name + "', xml = '" + xml + "', " +
  //       "formula_xml = '" + formula_xml + "'";

  var pf = parse_formula(formula_xml);
  if (typeof pf === "string") return pf;  // error

  pf.latex_style = latex_style;
  return pf;
}

// Strips the wrapper element
var strip_formula_wrap = function(stag, wrap_elem_name, xml) {
  return xml.substr(stag.length).replace(etag_regexps[wrap_elem_name], "");
}

// This finishes the parsing job, getting, as input:
// * If a <disp-formula> or <inline-formula> wrapper was give, whatever XML was inside; or
// * The original XML, which has an `mml:math`, `math`, or `tex-math` outermost element
// It returns an object like
//   {id: 'M1', format: 'latex', q: 'n^2'}
// (everything except 'style')

var parse_formula = function(xml) {
  var stag_match = inner_stag_regexp.exec(xml);
  if (!stag_match) return "Bad JATS formula, no start tag";

  var preamble_and_stag = stag_match[0]; // Everything before and including the start tag
  var preamble = stag_match[1]           // Everything before the start tag
  var stag = stag_match[2]               // The complete start tag
  var elem_name = stag_match[3]          // The element name

  //console.log("xml = '" + xml + "'\n" +
  //      "  preamble_and_stag = '" + preamble_and_stag + "',\n" +
  //      "  preamble          = '" + preamble + "',\n" +
  //      "  stag              = '" + stag + "',\n" +
  //      "  elem_name         = '" + elem_name + "',\n");

  var id_match = stag.match(id_regexp);
  var id = id_match ? id_match[2] : null;
  var format = elem_name == 'tex-math' ? 'latex' : 'mml';

  // Get the contents.  For mml, the contents include the start and end tags, but
  // throw away everything before the start tag. For latex, only include what is
  // between the start and end tags.
  var q;
  if (format == 'mml') {
    q = xml.substr(preamble.length);
  }
  else {
    var stag_length = preamble_and_stag.length;
    var etag_match = etag_regexps["tex-math"].exec(xml);
    if (!etag_match) return "No closing </tex-math> tag"
    q = xml.substr(stag_length, etag_match.index - stag_length);
  }

  return {
    id: id,
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
      return "Bad JATS file; missing closing tag </" + elem_name + ">";
    }
    var etag = etag_match[0];
    var xml = stag + jats.substr(0, etag_match.index) + etag;
    jats = jats.substr(etag_match.index + etag.length);

    var formula = parse_outer_formula(stag, elem_name, xml);
    if (typeof formula === "string") return formula;  // error
    formulas.push(formula);
  }

  if (formulas.length == 0) {return "No formulas found";}
  return formulas;
}

// Here's the one and only exported function
if (typeof exports === "undefined") { exports = {}; }
exports.parse_jats = parse_jats;
