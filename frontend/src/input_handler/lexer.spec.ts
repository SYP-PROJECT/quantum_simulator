import { Lexer, TokenType, Token } from "./lexer"

describe("Lexer", () => {
  function tokenize(lexer: Lexer): Token[] {
    const tokens: Token[] = [];

    let curTok = lexer.nextToken();

    while (curTok.type != TokenType.EOF) {
      tokens.push(curTok);
      curTok = lexer.nextToken();
    }

    tokens.push(curTok);
    return tokens;
  }



  test("keywords", () => {
    const lexer = new Lexer("create qubit apply");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.CREATE, value: "create" },
      { type: TokenType.QUBIT, value: "qubit" },
      { type: TokenType.APPLY, value: "apply" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("numbers and imaginary unit", () => {
    const lexer = new Lexer("42 3.14 5i");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.NUMBER, value: "42" },
      { type: TokenType.NUMBER, value: "3.14" },
      { type: TokenType.IMAGINARY_NUMBER, value: "5i" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("symbols", () => {
    const lexer = new Lexer("= + - * / , ; [ ]");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.EQUALS, value: "=" },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.MULTIPLY, value: "*" },
      { type: TokenType.DIVIDE, value: "/" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.LBRACKET, value: "[" },
      { type: TokenType.RBRACKET, value: "]" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("identifiers", () => {
    const lexer = new Lexer("myIdentifier another1 _third i");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.IDENTIFIER, value: "myIdentifier" },
      { type: TokenType.IDENTIFIER, value: "another1" },
      { type: TokenType.IDENTIFIER, value: "_third" },
      { type: TokenType.IDENTIFIER, value: "i" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("a simple create qubit statement", () => {
    const lexer = new Lexer("create qubit q1 = [1 + 2i, 2 - 3i];");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.CREATE, value: "create" },
      { type: TokenType.QUBIT, value: "qubit" },
      { type: TokenType.IDENTIFIER, value: "q1" },
      { type: TokenType.EQUALS, value: "=" },
      { type: TokenType.LBRACKET, value: "[" },
      { type: TokenType.NUMBER, value: "1" },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.IMAGINARY_NUMBER, value: "2i" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.NUMBER, value: "2" },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.IMAGINARY_NUMBER, value: "3i" },
      { type: TokenType.RBRACKET, value: "]" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("create with floating points", () => {
    const lexer = new Lexer("create qubit q2 = [1.5 + 2.3i, -3.1 - 4.0i];");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.CREATE, value: "create" },
      { type: TokenType.QUBIT, value: "qubit" },
      { type: TokenType.IDENTIFIER, value: "q2" },
      { type: TokenType.EQUALS, value: "=" },
      { type: TokenType.LBRACKET, value: "[" },
      { type: TokenType.NUMBER, value: "1.5" },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.IMAGINARY_NUMBER, value: "2.3i" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.NUMBER, value: "3.1" },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.IMAGINARY_NUMBER, value: "4.0i" },
      { type: TokenType.RBRACKET, value: "]" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("create with i identifier", () => {
    const lexer = new Lexer("create qubit i = [1 + 2i, -3 - 4i];");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.CREATE, value: "create" },
      { type: TokenType.QUBIT, value: "qubit" },
      { type: TokenType.IDENTIFIER, value: "i" },
      { type: TokenType.EQUALS, value: "=" },
      { type: TokenType.LBRACKET, value: "[" },
      { type: TokenType.NUMBER, value: "1" },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.IMAGINARY_NUMBER, value: "2i" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.NUMBER, value: "3" },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.IMAGINARY_NUMBER, value: "4i" },
      { type: TokenType.RBRACKET, value: "]" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("measure qubit", () => {
    const lexer = new Lexer("measure q1;");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.MEASURE, value: "measure" },
      { type: TokenType.IDENTIFIER, value: "q1" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.EOF, value: "" }
    ]);
  });

  test("display qubit", () => {
    const lexer = new Lexer("display q1;");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.DISPLAY, value: "display" },
      { type: TokenType.IDENTIFIER, value: "q1" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.EOF, value: "" }
    ]);
  });

  test("create with whitespace", () => {
    const lexer = new Lexer("   create    qubit   q1 = [ 1 + 2i , 2 - 3i ]; ");
    const tokens = tokenize(lexer);

    expect(tokens).toEqual([
      { type: TokenType.CREATE, value: "create" },
      { type: TokenType.QUBIT, value: "qubit" },
      { type: TokenType.IDENTIFIER, value: "q1" },
      { type: TokenType.EQUALS, value: "=" },
      { type: TokenType.LBRACKET, value: "[" },
      { type: TokenType.NUMBER, value: "1" },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.IMAGINARY_NUMBER, value: "2i" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.NUMBER, value: "2" },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.IMAGINARY_NUMBER, value: "3i" },
      { type: TokenType.RBRACKET, value: "]" },
      { type: TokenType.SEMICOLON, value: ";" },
      { type: TokenType.EOF, value: "" },
    ]);
  });

  test("throws error for unexpected tokens", () => {
    const lexer = new Lexer("create unknown@");
    expect(() => tokenize(lexer)).toThrow("Unexpected token: @");
  });

  test("throws error for invalid number format", () => {
    const lexer = new Lexer("4.2.3");

    expect(() => tokenize(lexer)).toThrow("Invalid number format: 4.2.3");
  });
})
