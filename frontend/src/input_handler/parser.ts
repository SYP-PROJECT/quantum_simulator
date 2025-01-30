import {
  ApplyStatementNode,
  ComplexArrayNode,
  CreateStatementNode,
  DisplayStatementNode,
  Expression,
  MeasureStatementNode,
  NodeType,
  ProgramNode,
  StatementNode
} from "./ast";
import {Lexer, Token, TokenType} from "./lexer";

enum Precedence {
  LOWEST,
  SUM,
  PRODUCT,
  PREFIX
}

const precedenceMap: Map<TokenType, Precedence> = new Map([
  [TokenType.PLUS, Precedence.SUM],
  [TokenType.MINUS, Precedence.SUM],
  [TokenType.MULTIPLY, Precedence.PRODUCT],
  [TokenType.DIVIDE, Precedence.PRODUCT],
]);

const synchronizationPoints = [TokenType.SEMICOLON, TokenType.EOF];

export class Parser {
  private lexer: Lexer = null!;
  private curToken: Token = null!;
  private peekToken: Token = null!;
  private errors: string[] = [];


  private prefixParsers = new Map([
    [TokenType.NUMBER, Parser.parseNumber],
    [TokenType.IMAGINARY_NUMBER, Parser.parseImaginaryNumber]
  ]);

  constructor() {
  }

  reset(lexer: Lexer) {
    this.lexer = lexer;
    this.errors = [];

    this.nextToken();
    this.nextToken();
  }

  public get Errors(): string[] {
    return this.errors;
  }

  private nextToken() {
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram(): ProgramNode {
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
      case TokenType.MEASURE:
        return this.parseMeasureStatement();
      case TokenType.DISPLAY:
        return this.parseDisplayStatement();
      case TokenType.APPLY:
        return this.parseApplyStatement();
      case TokenType.CREATE:
        return this.parseCreateStatement();
      default:
        this.errors.push("Only creation, measurement, apply and display can be used as statements");
        throw new Error();
    }
  }

  private static parseImaginaryNumber(instance: Parser): Expression {
    return {type: NodeType.ImaginaryNumber, value: parseFloat(instance.curToken.value)};
  }

  private static parseNumber(instance: Parser): Expression {
    return { type: NodeType.RealNumber, value: parseFloat(instance.curToken.value) };
  }

  private parseCreateStatement(): CreateStatementNode {
    this.expectPeek(TokenType.QUBIT);
    this.expectPeek(TokenType.IDENTIFIER);

    const identifier = this.curToken.value;

    this.expectPeek(TokenType.EQUALS);
    this.expectPeek(TokenType.LBRACKET);
    const statement: CreateStatementNode = { type: NodeType.CreateStatement, identifier: identifier, complexArray: this.parseExpressionList() };

    this.expectPeek(TokenType.SEMICOLON);
    return statement;
  }

  private parseExpressionList(): ComplexArrayNode {
    const expressions: Expression[] = [];

    if (this.peekTokenIs(TokenType.RBRACKET)) {
      this.nextToken();
      return { type: NodeType.ComplexArray, values: expressions };
    }

    this.nextToken();
    expressions.push(this.parseExpression(Precedence.LOWEST));


    while (this.peekTokenIs(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      expressions.push(this.parseExpression(Precedence.LOWEST));
    }

    this.expectPeek(TokenType.RBRACKET);
    return { type: NodeType.ComplexArray, values: expressions };
  }

  private parseExpression(precedence: Precedence): Expression {
    const prefix = this.prefixParsers.get(this.curToken.type);

    return prefix!(this);
  }

  private parseApplyStatement(): ApplyStatementNode {
    this.expectPeek(TokenType.IDENTIFIER);
    const identifier1 = this.curToken.value;

    this.expectPeek(TokenType.COMMA);

    this.expectPeek(TokenType.IDENTIFIER);
    const identifier2 = this.curToken.value;

    this.expectPeek(TokenType.SEMICOLON);

    return { type: NodeType.ApplyStatement, identifier1: identifier1, identifier2: identifier2 };
  }

  private parseDisplayStatement(): DisplayStatementNode {
    this.expectPeek(TokenType.IDENTIFIER);
    const identifier = this.curToken.value;

    this.expectPeek(TokenType.SEMICOLON);

    return { type: NodeType.DisplayStatement, identifier: identifier };
  }

  private parseMeasureStatement(): MeasureStatementNode {
    this.expectPeek(TokenType.IDENTIFIER);
    const identifier = this.curToken.value;

    this.expectPeek(TokenType.SEMICOLON);

    return { type: NodeType.MeasureStatement, identifier: identifier };
  }

  private expectPeek(t: TokenType) {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return;
    }

    this.addPeekError(t);
    throw new Error();
  }

  private addPeekError(t: TokenType) {
    this.errors.push(`Expected next token to be ${t}, got ${this.peekToken.type} instead`)
  }

  private curTokenIs = (t: TokenType) => this.curToken.type == t;
  private peekTokenIs = (t: TokenType) => this.peekToken.type == t;
}
