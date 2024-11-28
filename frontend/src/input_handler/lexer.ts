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
  WHITESPACE = "WHITESPACE",
  EOF = ""
}

export interface Token {
  type: TokenType;
  value: string;
}

export class Lexer {
  private input: string = "";
  private position: number = 0;

  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (/\s/.test(char)) {
        this.position++;
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        const word = this.readWhile(/[a-zA-Z0-9_]/);

        switch (word) {
          case "create":
            tokens.push({ type: TokenType.CREATE, value: word });
            break;
          case "qubit":
            tokens.push({ type: TokenType.QUBIT, value: word });
            break;
          case "connect":
            tokens.push({ type: TokenType.CONNECT, value: word });
            break;
          case "i":
            const prevToken = tokens[tokens.length - 1];

            if (prevToken && prevToken.type === TokenType.NUMBER) {
              tokens.push({ type: TokenType.IMAGINARY_UNIT, value: word });
            }
            else {
              tokens.push({ type: TokenType.IDENTIFIER, value: word });
            }
            break;
          default:
            tokens.push({ type: TokenType.IDENTIFIER, value: word });
            break;
        }
        continue;
      }

      if (/\d/.test(char) || char === ".") {
        const number = this.readWhile(/[0-9.]/);

        if (number.includes(".") && number.split(".").length > 2) {
          throw new Error(`Invalid number format: ${number}`);
        }
        tokens.push({ type: TokenType.NUMBER, value: number });
        continue;
      }


      switch (char) {
        case "+":
          tokens.push({ type: TokenType.PLUS, value: char });
          break;
        case "-":
          tokens.push({ type: TokenType.MINUS, value: char });
          break;
        case ",":
          tokens.push({ type: TokenType.COMMA, value: char });
          break;
        case "=":
          tokens.push({ type: TokenType.EQUALS, value: char });
          break;
        case ";":
          tokens.push({ type: TokenType.SEMICOLON, value: char });
          break;
        case "[":
          tokens.push({ type: TokenType.LBRACKET, value: char });
          break;
        case "]":
          tokens.push({ type: TokenType.RBRACKET, value: char });
          break;
        default:
          throw new Error(`Unexpected token: ${char}`);
      }
      this.position++;
    }

    tokens.push({ type: TokenType.EOF, value: "" });
    return tokens;
  }

  private readWhile(pattern: RegExp): string {
    let result = "";
    while (this.position < this.input.length && pattern.test(this.input[this.position])) {
      result += this.input[this.position];
      this.position++;
    }
    return result;
  }
}
