# texvcjs x.x.x (not yet released)

# texvcjs 0.3.1 (2014-07-29)

* Color models for \color, \definecolor, and \pagecolor are now
  case-insensitive.
* Accept all valid UTF-16 characters in box commands (\mbox, \text, etc).
* Bug fixes to matrix environment parsing: improve parsing of
  mandatory arguments to array/alignof.
* Add 287,201 test cases from enwiki.
* Ensure braces always surround function arguments when they are needed.

# texvcjs 0.3.0 (2014-07-24)

* Switch to text mode before emitting \AA and \textvisiblespace.
* Require mandatory argument for \overbrace, \overleftarrow,
  \overleftrightarrow, \overline, \overrightarrow, \underbrace, and
  \underline.
* Only allow \hline at the start of rows in a matrix context.
* Be stricter when parsing \color, \definecolor, and \pagecolor.
* Add `contains_func` to the API, to test for the presence of specific
  TeX functions in the validated/translated input string.
* Return `<foo>_required` fields in the result of `check` to provide
  more detailed information about the TeX functions encountered.

# texvcjs 0.2.0 (2014-07-23)

* Bug fixes to \begin{...} ... \end{...} environment parsing.
* Expose low-level API (parse, render, AST).

# texvcjs 0.1.0 (2014-07-22)

* First release.
