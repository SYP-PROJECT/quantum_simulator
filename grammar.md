# Grammar   
    Program         ::= (Statement ";")* ;
    Statement       ::= CreateStatement | ConnectStatement ;
    CreateStatement ::= "create qubit" Identifier "=" ComplexArray ;
    ApplyStatement  ::= "apply" Identifier "," Identifier ;

    Identifier      ::= [a-zA-Z_][a-zA-Z0-9_]* ;
    ComplexArray    ::= "[" ComplexNumber ("," ComplexNumber)* "]" ;
    ComplexNumber   ::= RealPart ("+" | "-") ImaginaryPart "i" ;
    RealPart        ::= Number ;
    ImaginaryPart   ::= Number ;
    Number          ::= ("+" | "-")? [0-9]+ ("." [0-9]+)? ;
    Whitespace      ::= [ \t]+ -> skip ;
    Newline         ::= [\r\n]+ -> skip ;
