import {Lexer, Token, TokenType} from './lexer';

describe('Lexer', () => {
    const expectToken = (type: TokenType, value: string, row: number, column: number): Token => ({
        type,
        value,
        row,
        column
    });

    const tokenizeAndExpect = (input: string, expected: Token[], errors: string[] = []) => {
        const lexer = new Lexer();
        const tokens = lexer.tokenize(input);
        expect(lexer.Errors).toEqual(errors);
        expect(tokens).toEqual(expected);
    };

    describe('Keywords', () => {
        test('should tokenize all keywords', () => {
            const input = 'qubit register gate measure if repeat print define as matrix for;';
            tokenizeAndExpect(input, [
                expectToken(TokenType.QUBIT, "qubit", 1, 1),
                expectToken(TokenType.REGISTER, "register", 1, 7),
                expectToken(TokenType.GATE, "gate", 1, 16),
                expectToken(TokenType.MEASURE, "measure", 1, 21),
                expectToken(TokenType.IF, "if", 1, 29),
                expectToken(TokenType.REPEAT, "repeat", 1, 32),
                expectToken(TokenType.PRINT, "print", 1, 39),
                expectToken(TokenType.DEFINE, "define", 1, 45),
                expectToken(TokenType.AS, "as", 1, 52),
                expectToken(TokenType.MATRIX, "matrix", 1, 55),
                expectToken(TokenType.FOR, "for", 1, 62),
                expectToken(TokenType.SEMICOLON, ";", 1, 65),
                expectToken(TokenType.EOF, "", 1, 66)
            ]);
        });
    });

    describe('Literals - Identifiers', () => {
        test('should tokenize identifier', () => {
            tokenizeAndExpect('q0;', [
                expectToken(TokenType.IDENTIFIER, "q0", 1, 1),
                expectToken(TokenType.SEMICOLON, ";", 1, 3),
                expectToken(TokenType.EOF, "", 1, 4)
            ]);
        });

        test('should tokenize identifier with underscore', () => {
            tokenizeAndExpect('my_gate;', [
                expectToken(TokenType.IDENTIFIER, "my_gate", 1, 1),
                expectToken(TokenType.SEMICOLON, ";", 1, 8),
                expectToken(TokenType.EOF, "", 1, 9)
            ]);
        });
    });

    describe('Literals - Numbers', () => {
        test('should tokenize integer', () => {
            tokenizeAndExpect('42;', [
                expectToken(TokenType.NUMBER, "42", 1, 1),
                expectToken(TokenType.SEMICOLON, ";", 1, 3),
                expectToken(TokenType.EOF, "", 1, 4)
            ]);
        });

        test('should tokenize negative integer', () => {
            tokenizeAndExpect('-42;', [
                expectToken(TokenType.MINUS, "-", 1, 1),
                expectToken(TokenType.NUMBER, "42", 1, 2),
                expectToken(TokenType.SEMICOLON, ";", 1, 4),
                expectToken(TokenType.EOF, "", 1, 5)
            ]);
        });

        test('should tokenize float', () => {
            tokenizeAndExpect('0.707;', [
                expectToken(TokenType.NUMBER, "0.707", 1, 1),
                expectToken(TokenType.SEMICOLON, ";", 1, 6),
                expectToken(TokenType.EOF, "", 1, 7)
            ]);
        });

        test('should tokenize negative float', () => {
            tokenizeAndExpect('-0.5;', [
                expectToken(TokenType.MINUS, "-", 1, 1),
                expectToken(TokenType.NUMBER, "0.5", 1, 2),
                expectToken(TokenType.SEMICOLON, ";", 1, 5),
                expectToken(TokenType.EOF, "", 1, 6)
            ]);
        });

        test('should tokenize complex number', () => {
            tokenizeAndExpect('1+2i;', [
                expectToken(TokenType.NUMBER, "1", 1, 1),
                expectToken(TokenType.PLUS, "+", 1, 2),
                expectToken(TokenType.IMAGINARY, "2i", 1, 3),
                expectToken(TokenType.SEMICOLON, ";", 1, 5),
                expectToken(TokenType.EOF, "", 1, 6)
            ]);
        });

        test('should tokenize negative complex number', () => {
            tokenizeAndExpect('-0.707+0.707i;', [
                expectToken(TokenType.MINUS, "-", 1, 1),
                expectToken(TokenType.NUMBER, "0.707", 1, 2),
                expectToken(TokenType.PLUS, "+", 1, 7),
                expectToken(TokenType.IMAGINARY, "0.707i", 1, 8),
                expectToken(TokenType.SEMICOLON, ";", 1, 14),
                expectToken(TokenType.EOF, "", 1, 15)
            ]);
        });

        test('should tokenize pure imaginary number', () => {
            tokenizeAndExpect('2i;', [
                expectToken(TokenType.IMAGINARY, "2i", 1, 1),
                expectToken(TokenType.SEMICOLON, ";", 1, 3),
                expectToken(TokenType.EOF, "", 1, 4)
            ]);
        });

        test('should tokenize negative pure imaginary number', () => {
            tokenizeAndExpect('-2i;', [
                expectToken(TokenType.MINUS, "-", 1, 1),
                expectToken(TokenType.IMAGINARY, "2i", 1, 2),
                expectToken(TokenType.SEMICOLON, ";", 1, 4),
                expectToken(TokenType.EOF, "", 1, 5)
            ]);
        });

        test('should report invalid number format', () => {
            tokenizeAndExpect('1.2.3;', [
                expectToken(TokenType.SEMICOLON, ";", 1, 6),
                expectToken(TokenType.EOF, "", 1, 7)
            ], ["(1, 1): Invalid number format: '1.2.3'"]);
        });

        test('should report invalid imaginary number format', () => {
            tokenizeAndExpect('2ii;', [
                expectToken(TokenType.SEMICOLON, ";", 1, 4),
                expectToken(TokenType.EOF, "", 1, 5)
            ], ["(1, 1): Invalid imaginary number format: '2ii'"]);
        });
    });

    describe('Operators', () => {
        test('should tokenize all operators', () => {
            tokenizeAndExpect('= => == + - * / | > >= < <=;', [
                expectToken(TokenType.ASSIGMENT, "=", 1, 1),
                expectToken(TokenType.GATE_APPLICATION, "=>", 1, 3),
                expectToken(TokenType.EQUALS, "==", 1, 6),
                expectToken(TokenType.PLUS, "+", 1, 9),
                expectToken(TokenType.MINUS, "-", 1, 11),
                expectToken(TokenType.MULTIPLY, "*", 1, 13),
                expectToken(TokenType.DIVIDE, "/", 1, 15),
                expectToken(TokenType.PIPE, "|", 1, 17),
                expectToken(TokenType.GREATER, ">", 1, 19),
                expectToken(TokenType.GEQ, ">=", 1, 21),
                expectToken(TokenType.LESS, "<", 1, 24),
                expectToken(TokenType.LEQ, "<=", 1, 26),
                expectToken(TokenType.SEMICOLON, ";", 1, 28),
                expectToken(TokenType.EOF, "", 1, 29)
            ]);
        });
    });

    describe('Delimiters', () => {
        test('should tokenize all delimiters', () => {
            tokenizeAndExpect('{}[],;', [
                expectToken(TokenType.LBRACE, "{", 1, 1),
                expectToken(TokenType.RBRACE, "}", 1, 2),
                expectToken(TokenType.LBRACKET, "[", 1, 3),
                expectToken(TokenType.RBRACKET, "]", 1, 4),
                expectToken(TokenType.COMMA, ",", 1, 5),
                expectToken(TokenType.SEMICOLON, ";", 1, 6),
                expectToken(TokenType.EOF, "", 1, 7)
            ]);
        });
    });

    describe('Combined Programs', () => {
        test('should tokenize a simple qubit program', () => {
            const input = 'qubit q0 = |0>; gate H => q0;';
            tokenizeAndExpect(input, [
                expectToken(TokenType.QUBIT, "qubit", 1, 1),
                expectToken(TokenType.IDENTIFIER, "q0", 1, 7),
                expectToken(TokenType.ASSIGMENT, "=", 1, 10),
                expectToken(TokenType.PIPE, "|", 1, 12),
                expectToken(TokenType.NUMBER, "0", 1, 13),
                expectToken(TokenType.GREATER, ">", 1, 14),
                expectToken(TokenType.SEMICOLON, ";", 1, 15),
                expectToken(TokenType.GATE, "gate", 1, 17),
                expectToken(TokenType.IDENTIFIER, "H", 1, 22),
                expectToken(TokenType.GATE_APPLICATION, "=>", 1, 24),
                expectToken(TokenType.IDENTIFIER, "q0", 1, 27),
                expectToken(TokenType.SEMICOLON, ";", 1, 29),
                expectToken(TokenType.EOF, "", 1, 30)
            ]);
        });

        test('should tokenize a gate definition', () => {
            const input = 'define gate MYGATE as matrix {[1, 0; 0, -0.707+0.707i]};';
            tokenizeAndExpect(input, [
                expectToken(TokenType.DEFINE, "define", 1, 1),
                expectToken(TokenType.GATE, "gate", 1, 8),
                expectToken(TokenType.IDENTIFIER, "MYGATE", 1, 13),
                expectToken(TokenType.AS, "as", 1, 20),
                expectToken(TokenType.MATRIX, "matrix", 1, 23),
                expectToken(TokenType.LBRACE, "{", 1, 30),
                expectToken(TokenType.LBRACKET, "[", 1, 31),
                expectToken(TokenType.NUMBER, "1", 1, 32),
                expectToken(TokenType.COMMA, ",", 1, 33),
                expectToken(TokenType.NUMBER, "0", 1, 35),
                expectToken(TokenType.SEMICOLON, ";", 1, 36),
                expectToken(TokenType.NUMBER, "0", 1, 38),
                expectToken(TokenType.COMMA, ",", 1, 39),
                expectToken(TokenType.MINUS, "-", 1, 41),
                expectToken(TokenType.NUMBER, "0.707", 1, 42),
                expectToken(TokenType.PLUS, "+", 1, 47),
                expectToken(TokenType.IMAGINARY, "0.707i", 1, 48),
                expectToken(TokenType.RBRACKET, "]", 1, 54),
                expectToken(TokenType.RBRACE, "}", 1, 55),
                expectToken(TokenType.SEMICOLON, ";", 1, 56),
                expectToken(TokenType.EOF, "", 1, 57)
            ]);
        });
    });

    describe('Whitespace and Comments', () => {
        test('should skip whitespace', () => {
            const input = 'qubit   q0\n\t;';
            tokenizeAndExpect(input, [
                expectToken(TokenType.QUBIT, "qubit", 1, 1),
                expectToken(TokenType.IDENTIFIER, "q0", 1, 9),
                expectToken(TokenType.SEMICOLON, ";", 2, 2),
                expectToken(TokenType.EOF, "", 2, 3)
            ]);
        });

        test('should skip comments', () => {
            const input = 'qubit # comment here\nq0;';
            tokenizeAndExpect(input, [
                expectToken(TokenType.QUBIT, "qubit", 1, 1),
                expectToken(TokenType.IDENTIFIER, "q0", 2, 1),
                expectToken(TokenType.SEMICOLON, ";", 2, 3),
                expectToken(TokenType.EOF, "", 2, 4)
            ]);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty input', () => {
            tokenizeAndExpect('', [
                expectToken(TokenType.EOF, "", 1, 1)
            ]);
        });

        test('should report unknown characters', () => {
            tokenizeAndExpect('@;', [
                expectToken(TokenType.SEMICOLON, ";", 1, 2),
                expectToken(TokenType.EOF, "", 1, 3)
            ], ["(1, 1): Unexpected character '@'"]);
        });

        test('should handle multiple lines with EOF', () => {
            const input = 'qubit q0;\nregister reg = 2;\n';
            tokenizeAndExpect(input, [
                expectToken(TokenType.QUBIT, "qubit", 1, 1),
                expectToken(TokenType.IDENTIFIER, "q0", 1, 7),
                expectToken(TokenType.SEMICOLON, ";", 1, 9),
                expectToken(TokenType.REGISTER, "register", 2, 1),
                expectToken(TokenType.IDENTIFIER, "reg", 2, 10),
                expectToken(TokenType.ASSIGMENT, "=", 2, 14),
                expectToken(TokenType.NUMBER, "2", 2, 16),
                expectToken(TokenType.SEMICOLON, ";", 2, 17),
                expectToken(TokenType.EOF, "", 3, 1)
            ]);
        });
    });
});