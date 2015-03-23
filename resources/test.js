// test.js

(function($) {

  // Sets the form's method to either 'GET' or 'POST', depending on the value of
  // the form's "method" control
  function setMethod() {
    $('#form').attr('method', $('#method').val());
  }

  // Handle any changes to the in-format select option.
  // Set the latex-style to enabled or disabled, according to the 
  // currently selected value of math format

  function in_format_handler() {
    var val = $('#math-in-format-select').val();
    if (val == 'mml' || val == 'jats') {
      $('#latex-style-select').attr('disabled', 'disabled');
      $('#latex-style-label').attr('class', 'disabled');
    }
    else {
      $('#latex-style-select').removeAttr('disabled');
      $('#latex-style-label').attr('class', '');
    }
    //if (val == 'latex' || val == 'mml') {
    //  $('#out-format-select').val('svg');
    //}
  }

/*
  function out_format_handler() {
    var val = $('#out-format-select').val();
    if (val == 'client') {
      $('#math-in-format-select').val('jats');
    }
  }
*/

  // List of examples that will appear
  var test_examples = [
    'simple-tex',
    'simple-mml',
    'cauchy-integral', 
    'cauchy-schwarz', 
    'christoffel-symbols',
    'coins',
    'cosines',
    'cross-product',
    'curl-vector-field',
    'gauss-divergence',
    'sum-displaystyle',
    'lorentz',
    'maxwell',
    'quadratic',
    'ramanujan',
    'rogers-rmanujan',
    'standard-deviation'
  ];

  // Populate the example list
  function make_example_list() {
    // Get the examples.yaml file
    var examples_ajax = $.ajax("examples/examples.yaml")
      .done(function(content) {
        var examples = jsyaml.load(content);
        var examples_by_name = {};
        examples.map(function(example) {
          examples_by_name[example.name] = example;
        });

        $('#examples-div ul').append(test_examples.map(function(te) {
          var example = examples_by_name[te];
          return "<li><a href='examples/" + example.filename + "'>" + example.description +
            "</a></li>";
        }));
        $('#examples-div a').on("click", function(event) {
          var example_ajax = $.ajax($(this).attr("href"))
            .done(function(content) {
              $('#q').val(content);
            })
            .fail(function() {
              // FIXME: do something here
            });
          return false;
        });
      })
      .fail(function() {
        // FIXME: do something here.
      });
  }


  $(document).ready(function() {
    // Check that browser supports the File API
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
      alert('Your browser doesn\'t seem to support the HTML File API, so you won\'t be able ' +
            'to upload files.');
    }

    // Event handlers
    $('#method').on('change', setMethod);
    $('#math-in-format-select').on('change', in_format_handler);
    $('#file').on('change', function(evt) {
      var file = evt.target.files[0];
      //console.log("file = %o", file);
      var reader = new FileReader();
      reader.onload = function(evt) {
        //console.log("finished reading the file");
        $('#q').val(evt.target.result);
      };
      reader.readAsText(file);
    });
    //$('#out-format-select').on('change', out_format_handler);

    // Page initialization
    setMethod();
    in_format_handler();
    make_example_list();
  });

})(jQuery);
