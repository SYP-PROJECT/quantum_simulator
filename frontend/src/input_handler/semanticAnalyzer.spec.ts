import { SemanticAnalyzer } from "./semanticAnalyzer";
import { ProgramNode, CreateStatementNode, ApplyStatementNode, MeasureStatementNode, DisplayStatementNode, NodeType } from "./ast";

describe("SemanticAnalyzer", () => {
  let analyzer: SemanticAnalyzer;

  beforeEach(() => {
    analyzer = new SemanticAnalyzer();
  });

  it("should allow variable creation and detect duplicates", () => {
    const createStatement: CreateStatementNode = {
      type: NodeType.CreateStatement,
      identifier: "q1",
      complexArray: {
        type: NodeType.ComplexArray,
        values: []
      }
    };

    const programNode: ProgramNode = {
      statements: [createStatement],
      type: NodeType.Program
    };

    analyzer.analyze(programNode);
    expect(analyzer.variables).toContain("q1");
    expect(analyzer.Errors).toHaveLength(0);

    analyzer.analyze(programNode);
    expect(analyzer.Errors).toContain("Identifier 'q1' was already declared");
  });

  it("should detect undeclared variables in apply statements", () => {
    const applyStatement: ApplyStatementNode = {
      type: NodeType.ApplyStatement,
      identifier1: "q1",
      identifier2: "q2"
    };

    const programNode: ProgramNode = {
      statements: [applyStatement],
      type: NodeType.Program
    };

    analyzer.analyze(programNode);
    expect(analyzer.Errors).toContain("Cannot resolve symbol 'q1'");
    expect(analyzer.Errors).toContain("Cannot resolve symbol 'q2'");
  });

  it("should detect undeclared variables in measure statements", () => {
    const measureStatement: MeasureStatementNode = {
      type: NodeType.MeasureStatement,
      identifier: "q1"
    };

    const programNode: ProgramNode = {
      statements: [measureStatement],
      type: NodeType.Program
    };

    analyzer.analyze(programNode);
    expect(analyzer.Errors).toContain("Cannot resolve symbol 'q1'");
  });

  it("should detect undeclared variables in display statements", () => {
    const displayStatement: DisplayStatementNode = {
      type: NodeType.DisplayStatement,
      identifier: "q1"
    };

    const programNode: ProgramNode = {
      statements: [displayStatement],
      type: NodeType.Program
    };

    analyzer.analyze(programNode);
    expect(analyzer.Errors).toContain("Cannot resolve symbol 'q1'");
  });

  it("should handle multiple statements correctly", () => {
    const createStatement: CreateStatementNode = {
      type: NodeType.CreateStatement,
      identifier: "q1",
      complexArray: {
        type: NodeType.ComplexArray,
        values: []
      }
    };

    const applyStatement: ApplyStatementNode = {
      type: NodeType.ApplyStatement,
      identifier1: "q1",
      identifier2: "q2"
    };

    const programNode: ProgramNode = {
      statements: [createStatement, applyStatement],
      type: NodeType.Program
    };

    analyzer.analyze(programNode);
    expect(analyzer.variables).toContain("q1");
    expect(analyzer.Errors).toContain("Cannot resolve symbol 'q2'");
  });
});
