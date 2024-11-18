# Grammar: 

## Non-Terminals
    Create Qubit Ident ";"
    Create Gate Ident ";"
    Connect Ident, Ident;"
    Measure Ident ";"

## Terminals
    Ident = char {Char}
    Create = "create"
    Connect = "connect"
    Measure = "measure"
    Gate = "gate"
    Qubit = "qubit"

# Lexical structure: 
## Keywords: 
    "connect", "create" "measure", "gate", "qubit" 
    
## Other Tokens: 
    ";", ","
    
    Whitespaces are ignored. Comments are possible with "/**/"
