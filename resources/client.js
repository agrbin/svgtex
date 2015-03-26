// This causes math formulas to be rerendered after the page has loaded with sources
// contained in the <div id='sources'>. The purpose is to guard against XSS where
// unsafe <script> elements, for example, could be included in with the MathML. This
// allows us to echo the math as escaped text, inside these divs, rather than as 
// unescaped XML.

(function($) {
    $(function() {
        // We push the operation onto the MathJax queue to make sure it is synchronized
        MathJax.Hub.queue.Push(function () {
            $('#sources div').each(function(i, s) {
                var $s = $(s);
                var rid = $s.attr("data-rid");
                var format = $s.attr("data-format");
                var content;
                if (format == 'mml') { 
                    // For MathML, MathJax seems to be able to handle serialized XML -- it
                    // parses it for us.
                    content = s.textContent; 
                }
                else {
                    // LaTeX is different. In the JATS file, it appears as an XML-escaped string.
                    // To sanitize it, the service xml-escapes it again before sending it to
                    // the client, so it is double-escaped. The browser gets rid of the second
                    // escaping. To get rid of the first, we let jQuery parse
                    // it into a set of DOM nodes, and then take the text value of that.
                    content = $($.parseHTML(s.textContent)).text();
                }
                MathJax.Hub.getAllJax(rid)[0].Text(content);
            });
        });
    })
})(jQuery);

