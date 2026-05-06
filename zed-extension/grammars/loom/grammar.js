module.exports = grammar({
  name: "loom",

  extras: () => [],

  rules: {
    document: ($) =>
      repeat(
        choice(
          $.heading,
          $.code_block,
          $.language_switch,
          $.transclusion,
          $.prose_block,
          $.blank_line,
        ),
      ),

    heading: ($) =>
      seq(
        field("marker", $._heading_marker),
        field("text", $._heading_text),
        optional(field("bracket", $.heading_bracket)),
        $._heading_eol,
      ),

    _heading_marker: () => token(prec(10, /#{1,6}[ \t]+/)),
    _heading_text: () => token.immediate(/[^\[\n]*/),
    heading_bracket: () =>
      token.immediate(seq("[", /[^\]\n]*/, "]", /[ \t]*/)),
    _heading_eol: () => /\n?/,

    code_block: ($) => prec.right(repeat1($.code_line)),

    code_line: () => token(prec(2, /[ \t]+\S[^\n]*\n?/)),

    language_switch: () =>
      token(prec(5, /[ \t]+\[[a-zA-Z_]\w*\][ \t]*\n?/)),

    transclusion: () =>
      token(prec(5, /[ \t]+\{\{[^}\n]+\}\}[ \t]*\n?/)),

    prose_block: ($) => prec.right(repeat1($.prose_line)),

    prose_line: () => token(prec(1, /[^#\s\n][^\n]*\n?/)),

    blank_line: () => token(prec(0, /[ \t]*\n/)),
  },
});
