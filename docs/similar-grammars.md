# Similar Grammars

This is a collection of grammars similar to the INI-file format. It should help to collect best practises and shorten the development of the EC-INI-grammar.

## JSON

This Grammar is concluded from the Standard-Document which is layed out as Syntax Diagram:

#### Explanation

- `m*nSOMEVALUE`: Repeat from `m` to `n` times (Default `m=0` & `n=Infinity`)
- `APPLE / BANANA`: Choose between alternatives
- `I EAT (APPLES / BANANAS)`: Subgroup pattern with parentheses
- `I EAT [FRESH / OLD] APPLES`: Optional Subgroup with square brackets
- `DIGIT HEXDIGIT DQUOTE`: Predefined ABNF-core constants

```abnf
LeftSquare   = "["
LeftCurly    = "{"
RightSquare  = "]"
RightCurly   = "}"
Colon        = ":"
Comma        = ","

True    = "true"
False   = "false"
Null    = "null"

Fraction  = "." 1*DIGIT
Exponent  = ("e" / "E") *1("+" / "-") 1*DIGIT
Number    = *1"-" ("1" / "2" / "3" / "4" / "5" / "6" / "7" / "8" / "9") *DIGIT *1Fraction *1Exponent

CommonChar = %20-21 / %23-5B / %5D-FF
; Excluding DQUOTE and Backslash
; This is probably inaccurate since it is probably possible to store
; characters beneath x20 in a string.

StringEscape = "\" (DQUOTE / "\" / "/" / "b" / "f" / "n" / "r" / "t" / "u" 4*4HEXDIGIT)
; The unicode-representation is not complete

Value   = Object
        / Array
        / Number
        / String
        / True
        / False
        / Null

Values  = Value *(Comma Value)
Pairs   = String Colon Value *(Comma String Colon Value)

object  = LeftCurly RightCurly
        / LeftCurly Pairs RightCurly
array   = LeftSquare RightSquare
        / LeftSquare Values RightSquare
```


### References

1. [Standard ECMA-404, 2nd Edition Dec '17](https://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf)
2. [RFC 2234 - Augmented BNF](http://www.faqs.org/rfcs/rfc2234.html)

## TOML

TBD
