enum TokenType {
  CREATE = "CREATE",
  QUBIT = "QUBIT",
  CONNECT = "CONNECT",
  IDENTIFIER = "IDENTIFIER",
  EQUALS = "EQUALS",
  COMMA = "COMMA",
  SEMICOLON = "SEMICOLON",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  PLUS = "PLUS",
  MINUS = "MINUS",
  NUMBER = "NUMBER",
  IMAGINARY_UNIT = "IMAGINARY_UNIT",
  WHITESPACE = "WHITESPACE"
}

interface Token {
  type: TokenType;
  value: string;
}

class Lexer {
  private rules: { type: TokenType; regex: RegExp }[] = [
    { type: TokenType.CREATE, regex: /^create/ },
    { type: TokenType.QUBIT, regex: /^qubit/ },
    { type: TokenType.CONNECT, regex: /^connect/ },
    { type: TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: TokenType.EQUALS, regex: /^=/ },
    { type: TokenType.COMMA, regex: /^,/ },
    { type: TokenType.SEMICOLON, regex: /^;/ },
    { type: TokenType.LBRACKET, regex: /^\[/ },
    { type: TokenType.RBRACKET, regex: /^\]/ },
    { type: TokenType.PLUS, regex: /^\+/ },
    { type: TokenType.MINUS, regex: /^-/ },
    { type: TokenType.NUMBER, regex: /^[0-9]+(\.[0-9]+)?/ },
    { type: TokenType.IMAGINARY_UNIT, regex: /^i/ },
    { type: TokenType.WHITESPACE, regex: /^\s+/ }
  ];
}
