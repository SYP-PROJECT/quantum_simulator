import { TokenType, Token } from "./lexer";

enum NodeType {
  Program = "Program",
  CreateStatement = "CreateStatement",
  ConnectStatement = "ConnectStatement",
  ComplexArray = "ComplexArray",
  ComplexNumber = "ComplexNumber",
  Number = "Number",
}

type ProgramNode = {
  type: NodeType.Program;
  statements: StatementNode[];
}

type StatementNode = CreateStatementNode | ConnectStatementNode;

type CreateStatementNode = {
  type: NodeType.CreateStatement;
  identifier: string;
  complexArray: ComplexArrayNode;
};

type ConnectStatementNode = {
  type: NodeType.ConnectStatement;
  identifier1: string;
  identifier2: string;
}

type ComplexArrayNode = {
  type: NodeType.ComplexArray;
  values: ComplexNumberNode[];
}

type ComplexNumberNode = {
  type: NodeType.ComplexNumber;
  realPart: NumberNode;
  sign: string;
  imaginaryPart: NumberNode;
}

type NumberNode = {
  type: NodeType.Number;
  value: number;
}

class Parser {
  private tokens: Token[];
  private current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  private peek(): Token | null {
    return this.current < this.tokens.length ? this.tokens[this.current + 1] : null;
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

  private parseComplexArray(): ComplexArrayNode {
    this.consume(TokenType.LBRACKET);
    const complexNumbers: ComplexNumberNode[] = [this.parseComplexNumber()];

    while (this.peek() && this.peek()!.type === TokenType.COMMA) {
      complexNumbers.push(this.parseComplexNumber());
    }

    this.consume(TokenType.RBRACKET);
    return { type: NodeType.ComplexArray, values: complexNumbers };
  }

  private parseComplexNumber(): ComplexNumberNode {
    const realPart = this.parseNumber();

    const signToken = this.peek();
    if (!signToken || (signToken.type !== TokenType.PLUS && signToken.type !== TokenType.MINUS)) {
      throw new Error(`Expected '+' or '-' but got ${signToken?.type || "end of input"} `);
    }

    const sign = this.consume(signToken.type).value;
    const imaginaryPart = this.parseNumber();
    this.consume(TokenType.IMAGINARY_UNIT);
    return { type: NodeType.ComplexNumber, realPart, sign, imaginaryPart };
  }

  private parseNumber(): NumberNode {
    const token = this.consume(TokenType.NUMBER);
    return { type: NodeType.Number, value: parseFloat(token.value) };
  }
}
