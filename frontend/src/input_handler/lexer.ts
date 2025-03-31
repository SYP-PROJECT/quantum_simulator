export enum TokenType {
    //Keywords
    QUBIT = "qubit",
    REGISTER = "register",
    GATE = "gate",
    MEASURE = "measure",
    IF = "if",
    REPEAT = "repeat",
    PRINT = "print",
    DEFINE = "define",
    AS = "as",
    MATRIX = "matrix",
    FOR = "for",
    LET = "let",
    TRUE = "true",
    FALSE = "false",

    //Literals
    IDENTIFIER = "identifier",
    NUMBER = "number",
    IMAGINARY = "imaginary",

    //Operators
    ASSIGMENT = "=",
    ARROW = "=>",
    EQUALS = "==",
    NOT_EQUALS = "!=",
    AND = "&&",
    OR = "||",
    NOT = "!",
    PLUS = "+",
    MINUS = "-",
    MULTIPLY = "*",
    DIVIDE = "/",
    PIPE = "|",
    LESS = "<",
    GREATER = ">",
    LEQ = "<=",
    GEQ = ">=",

    //Delimiters
    LBRACE = "{",
    RBRACE = "}",
    LBRACKET = "[",
    RBRACKET = "]",
    COMMA = ",",
    SEMICOLON = ";",
    EOF = "EOF",

    UNKNOWN = "unknown"
}

export interface Token {
    type: TokenType;
    value: string;
    row: number;
    column: number;
}

function CreateNewToken(type: TokenType, value: string, row: number, column: number): Token {
    return {type, value, row, column};
}

export class Lexer {
    private input: string = "";
    private readPosition: number = 0;
    private curChar: string = "";
    private row: number = 1;
    private column: number = 0;

    private errors: string[] = [];

    private keywords = new Set([
        "qubit", "register", "gate", "measure", "if", "repeat", "print", "define", "as", "matrix", "for", "let", "true", "false"
    ])

    public tokenize(input: string): Token[] {
        this.input = input;
        this.readPosition = 0;
        this.curChar = "";
        this.row = 1;
        this.column = 0;

        this.readChar();

        const tokens = [];
        let token: Token;

        do {
            token = this.nextToken();

            if (token.type != TokenType.UNKNOWN) {
                tokens.push(token);
            }
        } while (token.type !== TokenType.EOF);

        return tokens;
    }

    public get Errors(): string[] {
        return this.errors;
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

        if (this.curChar === "\n") {
            this.row++;
            this.column = 0;
        } else {
            this.column++;
        }
    }

    private peekChar(): string {
        if (this.readPosition >= this.input.length) {
            return "";
        } else {
            return this.input.at(this.readPosition)!;
        }
    }

    private nextToken(): Token {
        this.readWhile(/\s/);

        let newToken;

        const col = this.column;
        const row = this.row;
        if (/[a-zA-Z_]/.test(this.curChar)) {
            const word = this.readWhile(/[a-zA-Z0-9_]/);

            if (this.keywords.has(word)) {
                return CreateNewToken(word as TokenType, word, row, col);
            } else {
                return CreateNewToken(TokenType.IDENTIFIER, word, row, col);
            }
        }

        if (/\d/.test(this.curChar)) {
            const number = this.readWhile(/[0-9.i]/);

            const parts = number.split(".");
            if (parts.length > 2) {
                this.errors.push(`(${row}, ${col}): Invalid number format: '${number}'`);
                return CreateNewToken(TokenType.UNKNOWN, number, row, col);
            }

            if (number.includes("i")) {
                if (number.indexOf("i") !== number.length - 1) {
                    this.errors.push(`(${row}, ${col}): Invalid imaginary number format: '${number}'`);
                    return CreateNewToken(TokenType.UNKNOWN, number, row, col);
                }
            }

            return CreateNewToken(
                number.includes("i") ? TokenType.IMAGINARY : TokenType.NUMBER,
                number, row, col
            );
        }


        switch (this.curChar) {
            case "+":
                newToken = CreateNewToken(TokenType.PLUS, this.curChar, row, col);
                break;
            case "-":
                newToken = CreateNewToken(TokenType.MINUS, this.curChar, row, col);
                break;
            case ",":
                newToken = CreateNewToken(TokenType.COMMA, this.curChar, row, col);
                break;
            case "=": {
                const peek = this.peekChar();

                if (peek === ">") {
                    newToken = CreateNewToken(TokenType.ARROW, this.curChar + peek, row, col);
                    this.readChar();
                } else if (peek === "=") {
                    newToken = CreateNewToken(TokenType.EQUALS, this.curChar + peek, row, col);
                    this.readChar();
                } else {
                    newToken = CreateNewToken(TokenType.ASSIGMENT, this.curChar, row, col);
                }
                break;
            }
            case "!": {
                const peek = this.peekChar();

                if (peek === "=") {
                    newToken = CreateNewToken(TokenType.NOT_EQUALS, this.curChar + peek, row, col);
                    this.readChar();
                } else {
                    newToken = CreateNewToken(TokenType.NOT, this.curChar, row, col);
                }
                break;
            }
            case ";":
                newToken = CreateNewToken(TokenType.SEMICOLON, this.curChar, row, col);
                break;
            case "[":
                newToken = CreateNewToken(TokenType.LBRACKET, this.curChar, row, col);
                break;
            case "]":
                newToken = CreateNewToken(TokenType.RBRACKET, this.curChar, row, col);
                break;
            case "{":
                newToken = CreateNewToken(TokenType.LBRACE, this.curChar, row, col);
                break;
            case "}":
                newToken = CreateNewToken(TokenType.RBRACE, this.curChar, row, col);
                break;
            case "*":
                newToken = CreateNewToken(TokenType.MULTIPLY, this.curChar, row, col);
                break;
            case "/":
                newToken = CreateNewToken(TokenType.DIVIDE, this.curChar, row, col);
                break;
            case "#":
                this.readWhile(/[^\n]/);
                newToken = this.nextToken();
                return newToken;
            case "|": {
                const peek = this.peekChar();

                if (peek === "|") {
                    newToken = CreateNewToken(TokenType.OR, this.curChar + peek, row, col);
                    this.readChar();
                } else {
                    newToken = CreateNewToken(TokenType.PIPE, this.curChar, row, col);
                }
                break;
            }
            case "&": {
                const peek = this.peekChar();

                if (peek === "&") {
                    newToken = CreateNewToken(TokenType.AND, this.curChar + peek, row, col);
                    this.readChar();
                } else {
                    newToken = CreateNewToken(TokenType.UNKNOWN, this.curChar, row, col);
                }
                break;
            }
            case "<":
                if (this.peekChar() === "=") {
                    this.readChar();
                    newToken = CreateNewToken(TokenType.LEQ, "<" + this.curChar, row, col);
                    break;
                }
                newToken = CreateNewToken(TokenType.LESS, this.curChar, row, col);
                break;
            case ">":
                if (this.peekChar() === "=") {
                    this.readChar();
                    newToken = CreateNewToken(TokenType.GEQ, ">" + this.curChar, row, col);
                    break;
                }
                newToken = CreateNewToken(TokenType.GREATER, this.curChar, row, col);
                break;
            case "":
                newToken = CreateNewToken(TokenType.EOF, this.curChar, row, col);
                break;
            default:
                this.errors.push(`(${this.row}, ${this.column}): Unexpected character '${this.curChar}'`);
                newToken = CreateNewToken(TokenType.UNKNOWN, this.curChar, row, col);
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