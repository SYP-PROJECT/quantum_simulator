import {
    Expression,
    GateApplication,
    NodeType,
    ProgramNode,
    QubitDeclaration,
    RegisterDeclaration,
    StatementNode,
    Target
} from "./ast";
import {Token, TokenType} from "./lexer";

enum Precedence {
    LOWEST,
    AND,
    OR = 1,
    EQUALS,
    COMPARISON,
    SUM,
    PRODUCT,
    PREFIX
}

const precedenceMap: Map<TokenType, Precedence> = new Map([
    [TokenType.AND, Precedence.AND],
    [TokenType.OR, Precedence.OR],
    [TokenType.EQUALS, Precedence.EQUALS],
    [TokenType.NOT_EQUALS, Precedence.EQUALS],
    [TokenType.LEQ, Precedence.COMPARISON],
    [TokenType.GEQ, Precedence.COMPARISON],
    [TokenType.LESS, Precedence.COMPARISON],
    [TokenType.GREATER, Precedence.COMPARISON],
    [TokenType.PLUS, Precedence.SUM],
    [TokenType.MINUS, Precedence.SUM],
    [TokenType.MULTIPLY, Precedence.PRODUCT],
    [TokenType.DIVIDE, Precedence.PRODUCT],
]);


const synchronizationPoints = [TokenType.SEMICOLON, TokenType.EOF];

export class Parser {
    private tokens: Token[] = null!;
    private readPosition: number = 0;
    private curToken: Token = null!;
    private peekToken: Token = null!;
    private errors: string[] = [];

    private prefixParsers = new Map([
        [TokenType.NUMBER, this.parseNumber.bind(this)],
        [TokenType.IMAGINARY, this.parseImaginaryNumber.bind(this)],
        [TokenType.TRUE, this.parseBoolean.bind(this)],
        [TokenType.FALSE, this.parseBoolean.bind(this)],
        [TokenType.IDENTIFIER, this.parseIdentifier.bind(this)],
        [TokenType.PLUS, this.parsePrefixExpression.bind(this)],
        [TokenType.MINUS, this.parsePrefixExpression.bind(this)],
        [TokenType.NOT, this.parsePrefixExpression.bind(this)]
    ]);

    private infixParsers = new Map([
        [TokenType.AND, this.parseInfixExpression.bind(this)],
        [TokenType.OR, this.parseInfixExpression.bind(this)],
        [TokenType.EQUALS, this.parseInfixExpression.bind(this)],
        [TokenType.NOT_EQUALS, this.parseInfixExpression.bind(this)],
        [TokenType.LEQ, this.parseInfixExpression.bind(this)],
        [TokenType.GEQ, this.parseInfixExpression.bind(this)],
        [TokenType.LESS, this.parseInfixExpression.bind(this)],
        [TokenType.GREATER, this.parseInfixExpression.bind(this)],
        [TokenType.PLUS, this.parseInfixExpression.bind(this)],
        [TokenType.MINUS, this.parseInfixExpression.bind(this)],
        [TokenType.DIVIDE, this.parseInfixExpression.bind(this)],
        [TokenType.MULTIPLY, this.parseInfixExpression.bind(this)],
    ]);

    constructor() {
    }

    public get Errors(): string[] {
        return this.errors;
    }

    private nextToken() {
        this.curToken = this.peekToken;
        this.peekToken = this.readPosition >= this.tokens.length ? this.tokens[this.tokens.length - 1] : this.tokens[this.readPosition];
        this.readPosition++;
    }

    parseProgram(tokens: Token[]): ProgramNode {
        this.tokens = tokens;
        this.errors = [];
        this.readPosition = 0;

        this.nextToken();
        this.nextToken();

        const program: ProgramNode = {
            type: NodeType.Program, statements: []
        }

        while (!this.curTokenIs(TokenType.EOF)) {
            try {
                program.statements.push(this.parseStatement());
            } catch {
                this.resynchronize();
            }
            this.nextToken();
        }

        return program;
    }

    private resynchronize() {
        while (!synchronizationPoints.includes(this.curToken.type)) {
            this.nextToken();
        }
    }

    private parseStatement(): StatementNode {
        switch (this.curToken.type) {
            case TokenType.QUBIT:
                return this.parseQubitDeclaration();
            case TokenType.REGISTER:
                return this.parseRegisterDeclaration();
            case TokenType.GATE:
                return this.parseGateApplication();
            case TokenType.MEASURE:
                return this.parseMeasureStatement();
            case TokenType.LET:
                return this.parseLetStatement();
            case TokenType.REPEAT:
                return this.parseRepeatStatement();
            case TokenType.IF:
                return this.parseIfStatement();
            case TokenType.PRINT:
                return this.parsePrintStatement();
            default:
                this.errors.push(`(${this.curToken.row}, ${this.curToken.column}): Only creation, measurement, apply and print can be used as a statement`);
                throw new Error();
        }
    }

    private parsePrintStatement(): StatementNode{
        this.nextToken();
        const value = this.parseExpression(Precedence.LOWEST);
        this.expectPeek([TokenType.SEMICOLON]);
        return {type: NodeType.PrintStatement, value};
    }

    private parseIfStatement(): StatementNode {
        this.nextToken();
        const condition = this.parseExpression(Precedence.LOWEST);

        this.expectPeek([TokenType.LBRACE]);
        this.nextToken();

        const statements: StatementNode[] = [];

        while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
            try {
                statements.push(this.parseStatement());
            } catch {
                this.resynchronize();
            }
            this.nextToken();
        }

        return {type: NodeType.IfStatement, condition, statements};
    }

    private parseRepeatStatement(): StatementNode {
        this.expectPeek([TokenType.NUMBER]);
        const count = parseFloat(this.curToken.value);

        if(!Number.isInteger(count)){
            this.errors.push(`(${this.curToken.row}, ${this.curToken.column}): Repeat count must be an integer`);
            throw new Error();
        }

        this.expectPeek([TokenType.LBRACE]);
        this.nextToken();

        const statements: StatementNode[] = [];

        while (!this.curTokenIs(TokenType.RBRACE) && !this.curTokenIs(TokenType.EOF)) {
            try {
                statements.push(this.parseStatement());
            } catch {
                this.resynchronize();
            }
            this.nextToken();
        }

        return {type: NodeType.RepeatStatement, count, statements};
    }

    private parseLetStatement(): StatementNode {
        this.expectPeek([TokenType.IDENTIFIER]);
        const identifier = this.curToken.value;

        this.expectPeek([TokenType.ASSIGMENT]);
        this.nextToken();

        const value = this.parseExpression(Precedence.LOWEST);

        this.expectPeek([TokenType.SEMICOLON]);
        return {type: NodeType.LetStatement, identifier, value};
    }

    private parseMeasureStatement(): StatementNode {
        const target = this.parseTarget();

        this.expectPeek([TokenType.ARROW]);
        this.expectPeek([TokenType.IDENTIFIER]);

        const result = this.curToken.value;

        this.expectPeek([TokenType.SEMICOLON]);
        return {type: NodeType.MeasureStatement, target, result};
    }

    private parseGateApplication(): GateApplication {
        this.expectPeek([TokenType.IDENTIFIER]);
        const gate = this.curToken.value;

        this.expectPeek([TokenType.ARROW]);
        const target1 = this.parseTarget();

        if(this.peekTokenIs(TokenType.COMMA)){
            this.nextToken();
            const target2 = this.parseTarget();
            this.expectPeek([TokenType.SEMICOLON]);
            return {type: NodeType.GateApplication, gate: gate, targets: [target1, target2]};
        }

        this.expectPeek([TokenType.SEMICOLON]);
        return {type: NodeType.GateApplication, gate: gate, targets: [target1]};
    }

    private parseTarget(): Target {
        this.expectPeek([TokenType.IDENTIFIER]);
        const identifier = this.curToken.value;

        if(this.peekTokenIs(TokenType.LBRACKET)){
            this.nextToken();
            this.expectPeek([TokenType.NUMBER]);
            const index = parseFloat(this.curToken.value);

            if(!Number.isInteger(index)){
                this.errors.push(`(${this.curToken.row}, ${this.curToken.column}): Register index must be an integer`);
                throw new Error();
            }

            this.expectPeek([TokenType.RBRACKET]);
            return {type: NodeType.Target, identifier, index: index};
        }
        return {type: NodeType.Target, identifier, index: null};
    }

    private parseRegisterDeclaration(): RegisterDeclaration {
        this.expectPeek([TokenType.IDENTIFIER]);
        const identifier = this.curToken.value;

        this.expectPeek([TokenType.ASSIGMENT]);
        this.expectPeek([TokenType.NUMBER]);

        const numQubits = parseFloat(this.curToken.value);

        if(!Number.isInteger(numQubits)){
            this.errors.push(`(${this.curToken.row}, ${this.curToken.column}): Number of qubits must be an integer`);
            throw new Error();
        }

        this.expectPeek([TokenType.SEMICOLON]);
        return {type: NodeType.RegisterDeclaration, identifier: identifier, size: numQubits};
    }

    private parseQubitDeclaration(): QubitDeclaration {
        this.expectPeek([TokenType.IDENTIFIER]);
        const identifier = this.curToken.value;

        this.expectPeek([TokenType.ASSIGMENT]);
        const state = this.parseState();
        this.expectPeek([TokenType.SEMICOLON]);
        return {type: NodeType.QubitDeclaration, identifier: identifier, state: state};
    }

    private parseState(): "|0>" | "|1>" {
        this.expectPeek([TokenType.PIPE]);
        this.expectPeek([TokenType.NUMBER]);
        const state = this.curToken.value;

        if(state !== "0" && state !== "1") {
            this.errors.push(`(${this.curToken.row}, ${this.curToken.column}): Invalid qubit state '${this.curToken.value}'`);
            throw new Error();
        }

        this.expectPeek([TokenType.GREATER]);
        return state == "0" ? "|0>" : "|1>";
    }

    private parseInfixExpression(left: Expression): Expression {
        const operator = this.curToken.value;
        const precedence = this.curPrecedence();

        this.nextToken();

        const right = this.parseExpression(precedence);

        return {type: NodeType.InfixExpression, operator, left: left, right: right}
    }


    private parsePrefixExpression(): Expression {
        const operator = this.curToken.value;

        this.nextToken();

        const right = this.parseExpression(Precedence.PREFIX);
        return {type: NodeType.PrefixExpression, operator, right: right};
    }

    private parseImaginaryNumber(): Expression {
        return {type: NodeType.ImaginaryLiteral, value: parseFloat(this.curToken.value)};
    }

    private parseNumber(): Expression{
        return {type: NodeType.RealLiteral, value: parseFloat(this.curToken.value)};
    }

    private parseBoolean(): Expression {
        return {type: NodeType.BooleanLiteral, value: this.curToken.type === TokenType.TRUE};
    }

    private parseIdentifier(): Expression {
        return {type: NodeType.Identifier, value: this.curToken.value};
    }

    private parseExpression(precedence: Precedence): Expression {
        const prefix = this.prefixParsers.get(this.curToken.type);

        if (prefix === undefined) {
            this.errors.push(`No prefix parse function for ${this.curToken.type} found`);
            throw new Error();
        }

        let left: Expression = prefix();

        while (!this.peekTokenIs(TokenType.SEMICOLON) && precedence < this.peekPrecedence()) {
            const infixParser = this.infixParsers.get(this.peekToken.type);

            if (infixParser === undefined) {
                return left;
            }

            this.nextToken();

            left = infixParser(left);
        }
        return left;
    }

    private expectPeek(ts: TokenType[]) {
        for (const t of ts) {
            if (this.peekTokenIs(t)) {
                this.nextToken();
                return;
            }
        }

        this.addPeekError(ts);
        throw new Error();
    }

    private addPeekError(ts: TokenType[]) {
        this.errors.push(`(${this.peekToken.row}, ${this.peekToken.column}): Expected next token to be ${ts.map(x => "'" + x + "'").join(', ')}, got '${this.peekToken.type}' instead`)
    }

    private peekPrecedence(): Precedence {
        const precedence = precedenceMap.get(this.peekToken.type);

        return precedence === undefined ? Precedence.LOWEST : precedence;
    }

    private curPrecedence(): Precedence {
        const precedence = precedenceMap.get(this.curToken.type);

        return precedence === undefined ? Precedence.LOWEST : precedence;
    }

    private curTokenIs = (t: TokenType) => this.curToken.type == t;
    private peekTokenIs = (t: TokenType) => this.peekToken.type == t;
}