export enum NodeType {
  Program = "Program",
  CreateStatement = "CreateStatement",
  ApplyStatement = "ApplyStatement",
  MeasureStatement = "MeasureStatement",
  DisplayStatement = "DisplayStatement",
  ComplexArray = "ComplexArray",
  RealNumber = "RealNumber",
  ImaginaryNumber = "ImaginaryNumber",
  Number = "Number",
  InfixExpression = "InfixExpression",
  PrefixExpression = "PrefixExpression"
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
  values: Expression[];
}

export type Expression = RealNumberNode | ComplexNumberNode | InfixExpression | PrefixExpression;

export type PrefixExpression = {
  type: NodeType.PrefixExpression;
  op: string;
  right: Expression;
}

export type InfixExpression = {
  type: NodeType.InfixExpression;
  op: string;
  left: Expression;
  right: Expression;
}

export type RealNumberNode = {
  type: NodeType.RealNumber
  value: number
}

export type ComplexNumberNode = {
  type: NodeType.ImaginaryNumber
  value: number
}
