/*
 * mathjax-config-classic.3.4.1.js
 * MathJax configuration file customized for PMC, classic view.  
 */


MathJax.Hub.Config({
  extensions: [
    "tex2jax.js",
    "mml2jax.js",
    "MathEvents.js",
    "MathZoom.js",
    "MathMenu.js",
    "toMathML.js",
    "TeX/noErrors.js",
    "TeX/noUndefined.js",
    "TeX/AMSmath.js",
    "TeX/AMSsymbols.js"
  ],
  jax: [
    "input/TeX",
    "input/MathML",
    "output/SVG",
    "output/HTML-CSS"
  ],


  // PMC-specific configuration starts here
  "HTML-CSS": {
    scale: 120,
    linebreaks: {
      automatic: true,
      width: "container"
    },
    undefinedFamily: "STIXGeneral, 'Cambria Math', 'Arial Unicode MS'"
  },

  // HTML/CSS is the default, but the user might switch to SVG
  "SVG": {
    scale: 120,
    linebreaks: {
      automatic: true,
      width: "container"
    },
    undefinedFamily: "STIXGeneral, 'Cambria Math', 'Arial Unicode MS'"
  },
  showProcessingMessages: false,
  messageStyle: "none",
  menuSettings: {
    zoom: "Hover",
    zscale: "125%"
  },
  MathEvents: {
    hover: 100
  },
  MathZoom: {
    bodyDiv: true
  },

  TeX: {
    Macros: {
      AA: "{\\unicode{x212B}}",
      emph: ["\\mathit{#1}", 1],
      P: "{¶}",

      // upgreek
      upalpha: "{\\unicode[times]{x03B1}}",
      upbeta: "{\\unicode[times]{x03B2}}",
      upgamma: "{\\unicode[times]{x03B3}}",
      updelta: "{\\unicode[times]{x03B4}}",
      upepsilon: "{\\unicode[times]{x03B5}}",
      upzeta: "{\\unicode[times]{x03B6}}",
      upeta: "{\\unicode[times]{x03B7}}",
      uptheta: "{\\unicode[times]{x03B8}}",
      upiota: "{\\unicode[times]{x03B9}}",
      upkappa: "{\\unicode[times]{x03BA}}",
      uplambda: "{\\unicode[times]{x03BB}}",
      upmu: "{\\unicode[times]{x03BC}}",
      upnu: "{\\unicode[times]{x03BD}}",
      upxi: "{\\unicode[times]{x03BE}}",
      uppi: "{\\unicode[times]{x03C0}}",
      uprho: "{\\unicode[times]{x03C1}}",
      upsigma: "{\\unicode[times]{x03C3}}",
      uptau: "{\\unicode[times]{x03C4}}",
      upupsilon: "{\\unicode[times]{x03C5}}",
      upphi: "{\\unicode[times]{x03C6}}",
      upchi: "{\\unicode[times]{x03C7}}",
      uppsi: "{\\unicode[times]{x03C8}}",
      upomega: "{\\unicode[times]{x03C9}}",
      upvarepsilon: "{ε}",
      upvartheta: "{θ}",
      upvarpi: "{π}",
      upvarrho: "{ρ}",
      upvarsigma: "{σ}",
      upvarphi: "{φ}",
      Upgamma: "{\\unicode[times]{x0393}}",
      Updelta: "{\\unicode[times]{x0394}}",
      Uptheta: "{\\unicode[times]{x0398}}",
      Uplambda: "{\\unicode[times]{x039B}}",
      Upxi: "{\\unicode[times]{x039E}}",
      Uppi: "{\\unicode[times]{x03A0}}",
      Upsigma: "{\\unicode[times]{x03A3}}",
      Upupsilon: "{\\unicode[times]{x03A5}}",
      Upphi: "{\\unicode[times]{x03A6}}",
      Uppsi: "{\\unicode[times]{x03A8}}",
      Upomega: "{\\unicode[times]{x03A9}}",

      // wasysym symbols
      permil: "{‰}"
    }
  }

});

MathJax.Hub.Register.StartupHook("HTML-CSS multiline Ready", function () {
  MathJax.ElementJax.mml.mbase.prototype.HTMLlinebreakPenalty.nestfactor = 200;
  MathJax.ElementJax.mml.mbase.prototype.HTMLlinebreakPenalty.toobig = 1200;
});
MathJax.Hub.Register.StartupHook("SVG multiline Ready", function () {
  MathJax.ElementJax.mml.mbase.prototype.SVGlinebreakPenalty.nestfactor = 200;
  MathJax.ElementJax.mml.mbase.prototype.SVGlinebreakPenalty.toobig = 1200;
});


MathJax.Ajax.loadComplete(
  "http://www.ncbi.nlm.nih.gov/staff/maloneyc/mjconfig/mathjax-config-classic.3.4.1.js");

