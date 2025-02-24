import { NodeType, ProgramNode, StatementNode, CreateStatementNode, ApplyStatementNode, MeasureStatementNode, DisplayStatementNode } from "./ast";

export class SemanticAnalyzer {
  readonly variables: string[] = [];
  readonly gates: string[] = [];
  public readonly Errors: string[] = [];

  SemanticAnalyzer() {
  }

  public analyze(programNode: ProgramNode) {
    this.initializeMaps();
    for (const statement of programNode.statements) {
      this.analyzeStatement(statement);
    }
  }

  analyzeStatement(statement: StatementNode) {
    switch (statement.type) {
      case NodeType.CreateStatement: {
        const identifier = (statement as CreateStatementNode).identifier;

        if (this.variables.includes(identifier)) {
          this.Errors.push(`Identifier '${identifier}' was already declared`);
        }
        else {
          this.variables.push(identifier);
        }
        break;
      }

      case NodeType.ApplyStatement: {
        const applyStatement = (statement as ApplyStatementNode);

        const identifier1 = applyStatement.identifier1;
        const identifier2 = applyStatement.identifier2;

        if (!this.variables.includes(identifier1)) {
          this.Errors.push(`Cannot resolve symbol '${identifier1}'`);
        }

        if (!this.variables.includes(identifier2)) {
          this.Errors.push(`Cannot resolve symbol '${identifier2}'`);
        }
        break;
      }

      case NodeType.MeasureStatement: {
        const identifier = (statement as MeasureStatementNode).identifier;

        if (!this.variables.includes(identifier)) {
          this.Errors.push(`Cannot resolve symbol '${identifier}'`);
        }
        break;
      }

      case NodeType.DisplayStatement: {
        const identifier = (statement as DisplayStatementNode).identifier;

        if (!this.variables.includes(identifier)) {
          this.Errors.push(`Cannot resolve symbol '${identifier}'`);
        }
        break;
      }

    }
  }

  initializeMaps() {
    this.gates.length = 0;
    this.variables.length = 0;

    this.gates.push("identity");
    this.gates.push("pauliX");
    this.gates.push("pauliY");
    this.gates.push("pauliZ");
    this.gates.push("hadamard");
  }
}
