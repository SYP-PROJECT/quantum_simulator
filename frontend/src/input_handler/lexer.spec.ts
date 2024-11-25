import { Lexer, TokenType } from "./lexer"


describe("Lexer", () => {
  test("tokenizes a simple create qubit statement", () => {
    const input = "create qubit q1 = [1 + 2i, 2 - 3i];";
    const tokens = Lexer.tokenize(input);

    expect(tokens).toEqual([
      { type: TokenType.CREATE, value: "create" },
      { type: TokenType.QUBIT, value: "qubit" },
      { type: TokenType.IDENTIFIER, value: "q1" },
      { type: TokenType.EQUALS, value: "=" },
      { type: TokenType.LBRACKET, value: "[" },
      { type: TokenType.NUMBER, value: "1" },
      { type: TokenType.PLUS, value: "+" },
      { type: TokenType.NUMBER, value: "2" },
      { type: TokenType.IMAGINARY_UNIT, value: "i" },
      { type: TokenType.COMMA, value: "," },
      { type: TokenType.NUMBER, value: "2" },
      { type: TokenType.MINUS, value: "-" },
      { type: TokenType.NUMBER, value: "3" },
      { type: TokenType.IMAGINARY_UNIT, value: "i" },
      { type: TokenType.RBRACKET, value: "]" },
      { type: TokenType.SEMICOLON, value: ";" },
    ]);
  });
})
