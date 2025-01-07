import { Parser, NodeType } from "./parser";
import { Token, TokenType } from "./lexer";

describe("Parser", () => {
    let parser: Parser;

    beforeEach(() => {
        parser = new Parser();
    });

    const createToken = (type: TokenType, value: string): Token => ({ type, value });

    it("should parse an empty program", () => {
        const tokens: Token[] = [createToken(TokenType.EOF, "")];
        parser.reset(tokens);

        const program = parser.parseProgram();
        expect(program).toEqual({ type: NodeType.Program, statements: [] });
    });

    it("should parse a CreateStatement", () => {
        const tokens: Token[] = [
            createToken(TokenType.CREATE, "create"),
            createToken(TokenType.QUBIT, "qubit"),
            createToken(TokenType.IDENTIFIER, "q1"),
            createToken(TokenType.EQUALS, "="),
            createToken(TokenType.LBRACKET, "["),
            createToken(TokenType.NUMBER, "1"),
            createToken(TokenType.COMMA, ","),
            createToken(TokenType.NUMBER, "0"),
            createToken(TokenType.RBRACKET, "]"),
            createToken(TokenType.SEMICOLON, ";"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);
        const program = parser.parseProgram();

        expect(program).toEqual({
            type: NodeType.Program,
            statements: [
                {
                    type: NodeType.CreateStatement,
                    identifier: "q1",
                    complexArray: {
                        type: NodeType.ComplexArray,
                        values: [
                            { type: NodeType.ComplexNumber, realPart: { type: NodeType.Number, value: 1 }, imaginaryPart: null },
                            { type: NodeType.ComplexNumber, realPart: { type: NodeType.Number, value: 0 }, imaginaryPart: null },
                        ],
                    },
                },
            ],
        });
    });

    it("should parse an ApplyStatement", () => {
        const tokens: Token[] = [
            createToken(TokenType.APPLY, "apply"),
            createToken(TokenType.IDENTIFIER, "q1"),
            createToken(TokenType.COMMA, ","),
            createToken(TokenType.IDENTIFIER, "q2"),
            createToken(TokenType.SEMICOLON, ";"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);
        const program = parser.parseProgram();

        expect(program).toEqual({
            type: NodeType.Program,
            statements: [
                {
                    type: NodeType.ApplyStatement,
                    identifier1: "q1",
                    identifier2: "q2",
                },
            ],
        });
    });

    it("should parse a MeasureStatement", () => {
        const tokens: Token[] = [
            createToken(TokenType.MEASURE, "measure"),
            createToken(TokenType.IDENTIFIER, "q1"),
            createToken(TokenType.SEMICOLON, ";"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);
        const program = parser.parseProgram();

        expect(program).toEqual({
            type: NodeType.Program,
            statements: [
                {
                    type: NodeType.MeasureStatement,
                    identifier: "q1",
                },
            ],
        });
    });

    it("should parse a DisplayStatement", () => {
        const tokens: Token[] = [
            createToken(TokenType.DISPLAY, "display"),
            createToken(TokenType.IDENTIFIER, "q1"),
            createToken(TokenType.SEMICOLON, ";"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);
        const program = parser.parseProgram();

        expect(program).toEqual({
            type: NodeType.Program,
            statements: [
                {
                    type: NodeType.DisplayStatement,
                    identifier: "q1",
                },
            ],
        });
    });

    it("should throw an error for an invalid token", () => {
        const tokens: Token[] = [
            createToken(TokenType.NUMBER, "42"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);

        expect(() => parser.parseProgram()).toThrow("Unexpected token 42");
    });

    it("should throw an error for missing semicolon", () => {
        const tokens: Token[] = [
            createToken(TokenType.CREATE, "create"),
            createToken(TokenType.QUBIT, "qubit"),
            createToken(TokenType.IDENTIFIER, "q1"),
            createToken(TokenType.EQUALS, "="),
            createToken(TokenType.LBRACKET, "["),
            createToken(TokenType.NUMBER, "1"),
            createToken(TokenType.RBRACKET, "]"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);

        expect(() => parser.parseProgram()).toThrow("Expected token type SEMICOLON but got EOF");
    });

    it("should throw an error for an invalid complex number", () => {
        const tokens: Token[] = [
            createToken(TokenType.PLUS, "+"),
            createToken(TokenType.EOF, ""),
        ];

        parser.reset(tokens);

        expect(() => parser["parseComplexNumber"]()).toThrow("Invalid complex number: both real and imaginary parts are missing");
    });

    it("should parse a complex number with real and imaginary parts", () => {
        const tokens: Token[] = [
            createToken(TokenType.NUMBER, "3"),
            createToken(TokenType.PLUS, "+"),
            createToken(TokenType.NUMBER, "4"),
            createToken(TokenType.IMAGINARY_UNIT, "i"),
        ];

        parser.reset(tokens);
        const complexNumber = parser["parseComplexNumber"]();

        expect(complexNumber).toEqual({
            type: NodeType.ComplexNumber,
            realPart: { type: NodeType.Number, value: 3 },
            imaginaryPart: { type: NodeType.Number, value: 4 },
        });
    });
});
