# Quantum Programming Language Grammar

```ebnf
program = statementList ;
statementList = statement { statement } ;
statement = qubitDecl 
          | registerDecl 
          | gateApply 
          | gateDef 
          | measureStmt 
          | ifStmt 
          | repeatStmt 
          | printStmt 
          | comment ;

(* Comments *)
comment = "#", { anyChar - "\n" }, "\n" ;

(* Qubit Declaration *)
qubitDecl = "qubit", identifier, "=", state, ";" ;
state = "|0>" | "|1>" ;

(* Register Declaration *)
registerDecl = "register", identifier, "=", integer, ";" ;

(* Gate Application *)
gateApply = "gate", identifier, "=>", target, ";" ;
target = identifier                    (* Single qubit *)
       | identifier, "[", integer, "]" (* Qubit in register *)
       | identifier                    (* Entire register *)
       | identifier, ",", identifier   (* For multi-qubit gates like CNOT *) ;

(* Gate Definition *)
gateDef = matrixGateDef | compositeGateDef ;
matrixGateDef = "define", "gate", identifier, "as", "matrix", "{", matrix, "}", ";" ;
compositeGateDef = "define", "gate", identifier, "for", identifier, "{", statementList, "}", ";" ;
matrix = "[", row, { ";", row }, "]" ;
row = complexExpr, { ",", complexExpr } ;

(* Complex expressions *)
complexExpr = complexTerm, { addOp, complexTerm } ;
complexTerm = complexFactor, { mulOp, complexFactor } ;
complexFactor = [unaryOp], complexPrimary ;
complexPrimary = complexNum
               | "(", complexExpr, ")" ;

(* Complex number definition *)
complexNum = realExpr, [ "+", realExpr, "i" ] | realExpr, "i" | realExpr ;

(* Real expressions *)
realExpr = term, { addOp, term } ;
term = factor, { mulOp, factor } ;
factor = [unaryOp], primary ;
primary = real
        | "(", realExpr, ")" ;
unaryOp = "-" | "+" ;
addOp = "+" | "-" ;
mulOp = "*" | "/" | "%" ;

(* Real number definition *)
real = ["-"], integer, [ ".", integer ] ;

(* Measurement *)
measureStmt = "measure", target, "=>", identifier, ";" ;

(* Control Flow *)
ifStmt = "if", condition, "{", statementList, "}", ";" ;
condition = identifier, "==", integer ;
repeatStmt = "repeat", integer, "{", statementList, "}", ";" ;

(* Print *)
printStmt = "print", identifier, ";" ;

(* Lexical Elements *)
identifier = letter, { letter | digit | "_" } ;
integer = digit, { digit } ;
letter = "a".."z" | "A".."Z" ;
digit = "0".."9" ;
anyChar = (* any printable ASCII character *) ;
