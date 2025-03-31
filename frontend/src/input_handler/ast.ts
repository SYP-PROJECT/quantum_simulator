import {MeasureOptions} from "node:perf_hooks";

export enum NodeType {
  Program = "Program",
  QubitDeclaration = "QubitDeclaration",
  RegisterDeclaration = "RegisterDeclaration",
  GateApplication = "GateApplication",
  MeasureStatement = "MeasureStatement",
  Target = "Target",
  ComplexArray = "ComplexArray",
  RealNumber = "RealNumber",
  ImaginaryNumber = "ImaginaryNumber",
  InfixExpression = "InfixExpression",
  PrefixExpression = "PrefixExpression"
}

export type ProgramNode = {
  type: NodeType.Program;
  statements: StatementNode[];
}

export type StatementNode = QubitDeclaration | RegisterDeclaration | GateApplication | MeasureStatement;

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

export type Target = {
  type: NodeType.Target;
  identifier: string;
  index: number | null;
}