export enum NodeType {
  Program = "Program",
  QubitDeclaration = "QubitDeclaration",
  RegisterDeclaration = "RegisterDeclaration",
  GateApplication = "GateApplication",
  MeasureStatement = "MeasureStatement",
  Target = "Target",
  ComplexArray = "ComplexArray",
  LetStatement = "LetStatement",
  Identifier = "Identifier",
  RealLiteral = "RealLiteral",
  ImaginaryLiteral = "ImaginaryLiteral",
  PrefixExpression = "PrefixExpression",
  InfixExpression = "InfixExpression",
  RepeatStatement = "RepeatStatement",
}

export type ProgramNode = {
  type: NodeType.Program;
  statements: StatementNode[];
}

export type StatementNode = QubitDeclaration | RegisterDeclaration | GateApplication | MeasureStatement | LetStatement | RepeatStatement;

export type QubitDeclaration = {
  type: NodeType.QubitDeclaration;
  identifier: string;
  state: "|0>" | "|1>";
};

export type RegisterDeclaration = {
  type: NodeType.RegisterDeclaration;
  identifier: string;
  size: number;
};

export type GateApplication = {
    type: NodeType.GateApplication;
    gate: string;
    targets: Target[];
}

export type MeasureStatement = {
    type: NodeType.MeasureStatement;
    target: Target;
    result: string;
}

export type RepeatStatement = {
    type: NodeType.RepeatStatement;
    count: number;
    statements: StatementNode[];
}

export type LetStatement = {
    type: NodeType.LetStatement;
    identifier: string;
    value: Expression;
}

export type Target = {
  type: NodeType.Target;
  identifier: string;
  index: number | null;
}

export type Expression = Identifier | RealLiteral | ImaginaryLiteral | PrefixExpression | InfixExpression;

export type Identifier = {
  type: NodeType.Identifier;
  value: string;
}

export type RealLiteral = {
    type: NodeType.RealLiteral;
    value: number;
}

export type ImaginaryLiteral = {
    type: NodeType.ImaginaryLiteral;
    value: number;
}

export type PrefixExpression = {
    type: NodeType.PrefixExpression;
    operator: string;
    right: Expression;
}

export type InfixExpression = {
    type: NodeType.InfixExpression;
    left: Expression;
    operator: string;
    right: Expression;
}