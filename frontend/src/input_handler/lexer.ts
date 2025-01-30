export enum TokenType {
  CREATE = "CREATE",
  QUBIT = "QUBIT",
  APPLY = "APPLY",
  MEASURE = "MEASURE",
  DISPLAY = "DISPLAY",
  IDENTIFIER = "IDENTIFIER",
  EQUALS = "EQUALS",
  COMMA = "COMMA",
  SEMICOLON = "SEMICOLON",
  LBRACKET = "LBRACKET",
  RBRACKET = "RBRACKET",
  PLUS = "PLUS",
  MINUS = "MINUS",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  NUMBER = "NUMBER",
  IMAGINARY_NUMBER = "IMAGINARY_NUMBER",
  WHITESPACE = "WHITESPACE",
  EOF = "EOF"
}

export interface Token {
  type: TokenType;
  value: string;
}


function CreateNewToken(tokenType: TokenType, value: string): Token {
  return { type: tokenType, value: value };
}

export class Lexer {
  private input: string = "";
  private readPosition: number = 0;
  private curChar: string = "";


  public reset(input: string) {
    this.input = input;
    this.readPosition = 0;
    this.curChar = "";

    this.readChar();
  }

  constructor() {
  }

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.curChar = "";
    } else {
      this.curChar = this.input.at(this.readPosition)!;
    }
    this.readPosition++;
  }


  nextToken(): Token {
    this.readWhile(/\s/);

    let newToken;

    if (/[a-zA-Z_]/.test(this.curChar)) {
      const word = this.readWhile(/[a-zA-Z0-9_]/);

      switch (word) {
        case "create":
          newToken = CreateNewToken(TokenType.CREATE, word);
          break;
        case "qubit":
          newToken = CreateNewToken(TokenType.QUBIT, word);
          break;
        case "apply":
          newToken = CreateNewToken(TokenType.APPLY, word);
          break;
        case "measure":
          newToken = CreateNewToken(TokenType.MEASURE, word);
          break;
        case "display":
          newToken = CreateNewToken(TokenType.DISPLAY, word);
          break;
        default:
          newToken = CreateNewToken(TokenType.IDENTIFIER, word);
          break;
      }
      return newToken;
    }

    if (/\d/.test(this.curChar) || this.curChar === ".") {
      const number = this.readWhile(/[0-9.i]/);

      const parts = number.split(".");
      if (parts.length > 2) {
        throw new Error(`Invalid number format: ${number}`);
      }

      if (number.includes("i")) {
        if (number.indexOf("i") !== number.length - 1) {
          throw new Error(`Invalid imaginary number format: ${number}`);
        }
      }

      return CreateNewToken(
        number.includes("i") ? TokenType.IMAGINARY_NUMBER : TokenType.NUMBER,
        number,
      );
    }


    switch (this.curChar) {
      case "+":
        newToken = CreateNewToken(TokenType.PLUS, this.curChar);
        break;
      case "-":
        newToken = CreateNewToken(TokenType.MINUS, this.curChar);
        break;
      case ",":
        newToken = CreateNewToken(TokenType.COMMA, this.curChar);
        break;
      case "=":
        newToken = CreateNewToken(TokenType.EQUALS, this.curChar);
        break;
      case ";":
        newToken = CreateNewToken(TokenType.SEMICOLON, this.curChar);
        break;
      case "[":
        newToken = CreateNewToken(TokenType.LBRACKET, this.curChar);
        break;
      case "]":
        newToken = CreateNewToken(TokenType.RBRACKET, this.curChar);
        break;
      case "*":
        newToken = CreateNewToken(TokenType.MULTIPLY, this.curChar);
        break;
      case "/":
        if (this.input.at(this.readPosition) == "/") {
          this.readWhile(/[^\n]/)
          newToken = this.nextToken();
          break;
        }
        newToken = CreateNewToken(TokenType.DIVIDE, this.curChar);
        break;
      case "":
        newToken = CreateNewToken(TokenType.EOF, this.curChar);
        break;
      default:
        throw new Error(`Unexpected token: ${this.curChar}`);
    }
    this.readChar();
    return newToken;
  }

  private readWhile(pattern: RegExp): string {
    let result = "";
    while (pattern.test(this.curChar)) {
      result += this.curChar;
      this.readChar();
    }
    return result;
  }
}
