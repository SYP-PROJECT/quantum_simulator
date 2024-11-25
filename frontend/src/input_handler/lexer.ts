export enum TokenType {
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

export interface Token {
  type: TokenType;
  value: string;
}

export class Lexer {
  private static rules: { type: TokenType; regex: RegExp }[] = [
    { type: TokenType.CREATE, regex: /^create/ },
    { type: TokenType.QUBIT, regex: /^qubit/ },
    { type: TokenType.CONNECT, regex: /^connect/ },
    { type: TokenType.IMAGINARY_UNIT, regex: /^i(?![a-zA-Z0-9_])/ },
    { type: TokenType.IDENTIFIER, regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
    { type: TokenType.EQUALS, regex: /^=/ },
    { type: TokenType.COMMA, regex: /^,/ },
    { type: TokenType.SEMICOLON, regex: /^;/ },
    { type: TokenType.LBRACKET, regex: /^\[/ },
    { type: TokenType.RBRACKET, regex: /^\]/ },
    { type: TokenType.PLUS, regex: /^\+/ },
    { type: TokenType.MINUS, regex: /^-/ },
    { type: TokenType.NUMBER, regex: /^[0-9]+(\.[0-9]+)?/ },
    { type: TokenType.WHITESPACE, regex: /^\s+/ },
  ];

  static tokenize(input: string): Token[] {
    const tokens: Token[] = [];

    let remaining = input;

    while (remaining.length > 0) {
      let matched = false;

      for (const { type, regex } of this.rules) {
        const match = regex.exec(remaining);

        if (match) {
          matched = true;

          if (type !== TokenType.WHITESPACE) {
            tokens.push({ type, value: match[0] });
          }
          remaining = remaining.slice(match[0].length);
          break;
        }
      }

      if (!matched) {
        throw new Error(`Unexpected token: ${remaining[0]}`);
      }
    }

    return tokens;
  }
}
