export enum NodeType {
  Program = "Program",
  CreateStatement = "CreateStatement",
  ApplyStatement = "ApplyStatement",
  MeasureStatement = "MeasureStatement",
  DisplayStatement = "DisplayStatement",
  ComplexArray = "ComplexArray",
  ComplexNumber = "ComplexNumber",
  Number = "Number",
}

export type ProgramNode = {
  type: NodeType.Program;
  statements: StatementNode[];
}

export type StatementNode = CreateStatementNode | ApplyStatementNode | MeasureStatementNode | DisplayStatementNode;

export type CreateStatementNode = {
  type: NodeType.CreateStatement;
  identifier: string;
  complexArray: ComplexArrayNode;
};

export type ApplyStatementNode = {
  type: NodeType.ApplyStatement;
  identifier1: string;
  identifier2: string;
}

export type MeasureStatementNode = {
  type: NodeType.MeasureStatement;
  identifier: string;
}

export type DisplayStatementNode = {
  type: NodeType.DisplayStatement;
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
