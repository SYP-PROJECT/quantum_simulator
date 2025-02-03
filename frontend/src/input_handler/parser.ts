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
import { Lexer, Token, TokenType } from "./lexer";

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
    [TokenType.NUMBER, this.parseNumber.bind(this)],
    [TokenType.IMAGINARY_NUMBER, this.parseImaginaryNumber.bind(this)],
    [TokenType.PLUS, this.parsePrefixExpression.bind(this)],
    [TokenType.MINUS, this.parsePrefixExpression.bind(this)]
  ]);

  private infixParsers = new Map([
    [TokenType.PLUS, this.parseInfixExpression.bind(this)],
    [TokenType.MINUS, this.parseInfixExpression.bind(this)],
    [TokenType.DIVIDE, this.parseInfixExpression.bind(this)],
    [TokenType.MULTIPLY, this.parseInfixExpression.bind(this)],
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

  private parseInfixExpression(left: Expression): Expression {
    const operator = this.curToken.value;
    const precedence = this.curPrecedence();

    this.nextToken();

    const right = this.parseExpression(precedence);

    return { type: NodeType.InfixExpression, op: operator, left: left, right: right }
  }


  private parsePrefixExpression(): Expression {
    const operator = this.curToken.value;

    this.nextToken();

    const right = this.parseExpression(Precedence.PREFIX);
    return { type: NodeType.PrefixExpression, op: operator, right: right };
  }

  private parseImaginaryNumber(): Expression {
    return { type: NodeType.ImaginaryNumber, value: parseFloat(this.curToken.value) };
  }

  private parseNumber(): Expression {
    return { type: NodeType.RealNumber, value: parseFloat(this.curToken.value) };
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