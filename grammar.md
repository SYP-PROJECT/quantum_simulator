# Grammar: 

## Non-Terminals
    Create Gate Ident ";"
    Connect Ident {"," Ident} ";"
    Measure Ident ";"

## Terminals
    Ident = char {Char}
    Create = "create"
    Connect = "connect"
    Measure = "measure"
    Gate = "gate"

# Lexical structur: 
## Keywords: 
    "connect", "create" "measure", "gate" 
    
## Other Tokens: 
    ";", ","
    
    Whitespaces are ignored. Comments are possible with "/**/"
