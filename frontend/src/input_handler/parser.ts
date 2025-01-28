import {MeasureStatementNode, NodeType, ProgramNode, StatementNode} from "./ast";
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

    while (!this.CurTokenIs(TokenType.EOF)) {
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
      default:
        this.errors.push("Only creation, measurement and display can be used as statements");
        throw new Error();
    }
  }

  private parseMeasureStatement(): MeasureStatementNode {
    this.ExpectPeek(TokenType.IDENTIFIER);
    const identifier = this.curToken.value;

    this.ExpectPeek(TokenType.SEMICOLON);

    return { type: NodeType.MeasureStatement, identifier: identifier };
  }

  private ExpectPeek(t: TokenType) {
    if (this.PeekTokenIs(t)) {
      this.nextToken();
      return;
    }

    this.AddPeekError(t);
    throw new Error();
  }

  private AddPeekError(t: TokenType) {
    this.errors.push(`Expected next token to be ${t}, got ${this.peekToken.type} instead`)
  }

  private CurTokenIs = (t: TokenType) => this.curToken.type == t;
  private PeekTokenIs = (t: TokenType) => this.peekToken.type == t;
}
