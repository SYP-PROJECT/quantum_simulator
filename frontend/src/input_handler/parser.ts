import { Token, TokenType } from "./lexer";

enum NodeType {
  Program = "Program",
  CreateStatement = "CreateStatement",
  ConnectStatement = "ConnectStatement",
  MeasureStatement = "MeasureStatement",
  ComplexArray = "ComplexArray",
  ComplexNumber = "ComplexNumber",
  Number = "Number",
}

export type ProgramNode = {
  type: NodeType.Program;
  statements: StatementNode[];
}

export type StatementNode = CreateStatementNode | ConnectStatementNode | MeasureStatementNode;

export type CreateStatementNode = {
  type: NodeType.CreateStatement;
  identifier: string;
  complexArray: ComplexArrayNode;
};

export type ConnectStatementNode = {
  type: NodeType.ConnectStatement;
  identifier1: string;
  identifier2: string;
}

export type MeasureStatementNode = {
  type: NodeType.MeasureStatement;
  identifier: string;
}

export type ComplexArrayNode = {
  type: NodeType.ComplexArray;
  values: ComplexNumberNode[];
}

export type ComplexNumberNode = {
  type: NodeType.ComplexNumber;
  realPart: NumberNode | null;
  imaginaryPart: NumberNode | null;
}

export type NumberNode = {
  type: NodeType.Number;
  value: number;
}

export class Parser {
  private tokens: Token[] = [];
  private current: number = 0;

  constructor() {
  }

  private peek(): Token | null {
    return this.current < this.tokens.length ? this.tokens[this.current] : null;
  }

  private consume(expectedType: TokenType): Token {
    const token = this.peek();
    if (!token || token.type !== expectedType) {
      throw new Error(
        `Expected token type ${expectedType} but got ${token?.type || "end of input"}`
      );
    }
    this.current++;
    return token;
  }

  public parseProgram(): ProgramNode {
    const statements: StatementNode[] = [];

    while (this.peek() && this.peek()?.type !== TokenType.EOF) {
      statements.push(this.parseStatement());
      this.consume(TokenType.SEMICOLON);
    }
    return { type: NodeType.Program, statements };
  }

  private parseStatement(): StatementNode {
    const token = this.peek();
    if (token?.type === TokenType.CREATE) {
      return this.parseCreateStatement();
    }
    else if (token?.type === TokenType.CONNECT) {
      return this.parseConnectStatement();
    }
    else if (token?.type === TokenType.MEASURE) {
      return this.parseMeasureStatement();
    }
    else {
      throw new Error(`Unexpected token ${token?.value}`);
    }
  }

  private parseCreateStatement(): CreateStatementNode {
    this.consume(TokenType.CREATE);
    this.consume(TokenType.QUBIT);

    const identifier = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.EQUALS);

    const complexArray = this.parseComplexArray();
    return { type: NodeType.CreateStatement, identifier, complexArray };
  }

  private parseConnectStatement(): ConnectStatementNode {
    this.consume(TokenType.CONNECT);
    const identifier1 = this.consume(TokenType.IDENTIFIER).value;

    this.consume(TokenType.COMMA);

    const identifier2 = this.consume(TokenType.IDENTIFIER).value;
    return { type: NodeType.ConnectStatement, identifier1, identifier2 };
  }

  private parseMeasureStatement(): MeasureStatementNode {
    this.consume(TokenType.MEASURE);
    const identifier = this.consume(TokenType.IDENTIFIER).value;

    this.consume(TokenType.SEMICOLON);

    return { type: NodeType.MeasureStatement, identifier };
  }

  private parseComplexArray(): ComplexArrayNode {
    this.consume(TokenType.LBRACKET);
    const complexNumbers: ComplexNumberNode[] = [this.parseComplexNumber()];

    while (this.peek() && this.peek()!.type === TokenType.COMMA) {
      this.consume(TokenType.COMMA);
      complexNumbers.push(this.parseComplexNumber());
    }

    this.consume(TokenType.RBRACKET);
    return { type: NodeType.ComplexArray, values: complexNumbers };
  }

  private parseComplexNumber(): ComplexNumberNode {
    let realPart: NumberNode | null = null;
    let imaginaryPart: NumberNode | null = null;

    let sign = "";
    if (this.peek()?.type === TokenType.PLUS || this.peek()?.type === TokenType.MINUS) {
      sign = this.consume(this.peek()!.type).value;
    }

    if (this.peek()?.type === TokenType.NUMBER) {
      realPart = this.parseNumber();
      if (sign) {
        realPart.value = parseFloat(sign + realPart.value);
      }
      sign = "";
    }

    if (this.peek()?.type === TokenType.PLUS || this.peek()?.type === TokenType.MINUS) {
      sign = this.consume(this.peek()!.type).value;
    }

    if (this.peek()?.type === TokenType.NUMBER) {
      imaginaryPart = this.parseNumber();

      if (sign) {
        imaginaryPart.value = parseFloat(sign + imaginaryPart.value);
      }
      this.consume(TokenType.IMAGINARY_UNIT);
    }

    if (!realPart && !imaginaryPart) {
      throw new Error("Invalid complex number: both real and imaginary parts are missing");
    }

    return {
      type: NodeType.ComplexNumber,
      realPart,
      imaginaryPart,
    };

  }

  private parseNumber(): NumberNode {
    const token = this.consume(TokenType.NUMBER);
    return { type: NodeType.Number, value: parseFloat(token.value) };
  }

  reset(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }
}
