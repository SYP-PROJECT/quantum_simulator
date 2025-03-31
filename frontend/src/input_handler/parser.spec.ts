import { Parser } from "./parser";
import { Lexer } from "./lexer";
import { NodeType } from "./ast";

describe('Parser', () => {
  const lexer = new Lexer();

  test('should parse an empty program', () => {
    const tokens = lexer.tokenize("");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(program.statements).toHaveLength(0);
  });

  test('should parse a simple qubit declaration', () => {
    const tokens = lexer.tokenize("qubit q = |0>;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.QubitDeclaration,
        identifier: "q",
        state: "|0>"
      }
    ]);
  });

  test('should parse a simple measure statement', () => {
    const tokens = lexer.tokenize("measure q => r;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        target: { type: NodeType.Target, identifier: "q", index: null },
        result: "r"
      }
    ]);
  });

  test('should parse a simple measure statement with index', () => {
    const tokens = lexer.tokenize("measure r[2] => a;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        target: { type: NodeType.Target, identifier: "r", index: 2 },
        result: "a"
      }
    ]);
  });

  test('should parse a simple let statement with identifier', () => {
    const tokens = lexer.tokenize("let a = b;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: { type: NodeType.Identifier, value: "b" }
      }
    ]);
  });

  test('should parse a simple let statement with number', () => {
    const tokens = lexer.tokenize("let a = 2;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: { type: NodeType.RealLiteral, value: 2 }
      }
    ]);
  });

  test('should parse a simple let statement with imaginary number', () => {
    const tokens = lexer.tokenize("let a = 2i;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: { type: NodeType.ImaginaryLiteral, value: 2 }
      }
    ]);
  });

  test('should parse a simple let statement with prefix expression', () => {
    const tokens = lexer.tokenize("let a = -2i;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: {
          type: NodeType.PrefixExpression,
          operator: "-",
          right: {
            type: NodeType.ImaginaryLiteral,
            value: 2 }
        }
      }
    ]);
  });

  test('should parse a simple let statement with infix expression', () => {
    const tokens = lexer.tokenize("let a = -2i + 2;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: {
          type: NodeType.InfixExpression,
          left: {
            type: NodeType.PrefixExpression,
            operator: "-",
            right: {
              type: NodeType.ImaginaryLiteral,
              value: 2 }
          },
          operator: "+",
            right: {
                type: NodeType.RealLiteral,
                value: 2
            }
        }
      }
    ]);
  });

  test('should parse a simple let statement with equal expression', () => {
    const tokens = lexer.tokenize("let a = -2i == 2;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: {
          type: NodeType.InfixExpression,
          left: {
            type: NodeType.PrefixExpression,
            operator: "-",
            right: {
              type: NodeType.ImaginaryLiteral,
              value: 2 }
          },
          operator: "==",
          right: {
            type: NodeType.RealLiteral,
            value: 2
          }
        }
      }
    ]);
  });

  test('should parse a simple let statement with comparison expression', () => {
    const tokens = lexer.tokenize("let a = -2i <= 2;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.LetStatement,
        identifier: "a",
        value: {
          type: NodeType.InfixExpression,
          left: {
            type: NodeType.PrefixExpression,
            operator: "-",
            right: {
              type: NodeType.ImaginaryLiteral,
              value: 2 }
          },
          operator: "<=",
          right: {
            type: NodeType.RealLiteral,
            value: 2
          }
        }
      }
    ]);
  });

  test('should throw an error for an unexpected token', () => {
    const tokens = lexer.tokenize("INVALID");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 1): Only creation, measurement, apply and display can be used as statements"]);
    expect(program.statements).toHaveLength(0);
  });

  test('should resynchronize after encountering an error', () => {
    const tokens = lexer.tokenize("INVALID; measure q => r;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 1): Only creation, measurement, apply and display can be used as statements"]);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        target: { type: NodeType.Target, identifier: "q", index: null },
        result: "r"
      }
    ]);
  });

  test('should resynchronize on EOF', () => {
    const tokens = lexer.tokenize("INVALID; measure q => r; INVALID measure q => r");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(2);
    expect(parser.Errors).toStrictEqual([
      "(1, 1): Only creation, measurement, apply and display can be used as statements",
      "(1, 26): Only creation, measurement, apply and display can be used as statements"
    ]);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        target: { type: NodeType.Target, identifier: "q", index: null},
        result: "r"
      }
    ]);
  });

  test('should add an error for missing target in measure statement', () => {
    const tokens = lexer.tokenize("measure;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 8): Expected next token to be identifier, got ';' instead"]);
    expect(program.statements).toHaveLength(0);
  });

  test('should parse a simple gate application', () => {
    const tokens = lexer.tokenize("gate H => q;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.GateApplication,
        gate: "H",
        targets: [{ type: NodeType.Target, identifier: "q", index: null }]
      }
    ]);
  });

  test('should parse a gate application with indexed target', () => {
    const tokens = lexer.tokenize("gate H => r[2];");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.GateApplication,
        gate: "H",
        targets: [{ type: NodeType.Target, identifier: "r", index: 2}]
      }
    ]);
  });

  test('should parse a gate application with two targets', () => {
    const tokens = lexer.tokenize("gate CNOT => q1, q2;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.GateApplication,
        gate: "CNOT",
        targets: [{ type: NodeType.Target, identifier: "q1", index: null }, { type: NodeType.Target, identifier: "q2", index: null }]
      }
    ]);
  });

  test('should add an error for missing target in gate application', () => {
    const tokens = lexer.tokenize("gate H => ;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 11): Expected next token to be identifier, got ';' instead"]);
    expect(program.statements).toHaveLength(0);
  });

  test('should parse a register declaration', () => {
    const tokens = lexer.tokenize("register r = 4;");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.RegisterDeclaration,
        identifier: "r",
        size:  4
      }
    ]);
  });

  /*
  test('should parse a matrix gate definition with identifiers', () => {
    const tokens = lexer.tokenize("define gate H as matrix { [a, b + c] };");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MatrixGateDefinition,
        identifier: "H",
        matrix: {
          type: NodeType.Matrix,
          rows: [
            {
              type: NodeType.MatrixRow,
              values: [
                { type: NodeType.ComplexExpression, left: { type: NodeType.Identifier, value: "a" }, right: null },
                {
                  type: NodeType.ComplexExpression,
                  left: {
                    type: NodeType.InfixExpression,
                    op: "+",
                    left: { type: NodeType.Identifier, value: "b" },
                    right: { type: NodeType.Identifier, value: "c" }
                  },
                  right: null
                }
              ]
            }
          ]
        }
      }
    ]);
  });

  test('should parse a composite gate definition', () => {
    const tokens = lexer.tokenize("define gate MYGATE for q { gate H => q; };");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CompositeGateDefinition,
        identifier: "MYGATE",
        targetIdentifier: "q",
        body: [
          {
            type: NodeType.GateApplication,
            gateIdentifier: "H",
            targets: [{ type: NodeType.Target, identifier: "q", index: null, secondIdentifier: null }]
          }
        ]
      }
    ]);
  });
*/
  test('should parse a repeat statement', () => {
    const tokens = lexer.tokenize("repeat 3 { gate H => q; }");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.RepeatStatement,
        count: 3,
        statements: [
          {
            type: NodeType.GateApplication,
            gate: "H",
            targets: [{ type: NodeType.Target, identifier: "q", index: null }]
          }
        ]
      }
    ]);
  });

  test('should parse an if statement with identifier comparison', () => {
    const tokens = lexer.tokenize("if a < b { gate H => q; }");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.IfStatement,
        condition: {
              type: NodeType.InfixExpression,
              operator: "<",
              left: { type: NodeType.Identifier, value: "a" },
              right: { type: NodeType.Identifier, value: "b" }
        },
        statements: [
          {
            type: NodeType.GateApplication,
            gate: "H",
            targets: [{ type: NodeType.Target, identifier: "q", index: null }]
          }
        ]
      }
    ]);
  });

  test('should parse complex expression with identifiers and comparison', () => {
    const tokens = lexer.tokenize("if a + b < c - d { qubit q = |0>; }");
    const parser = new Parser();
    const program = parser.parseProgram(tokens);
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.IfStatement,
        condition: {
          type: NodeType.InfixExpression,
          operator: "<",
          left: {
            type: NodeType.InfixExpression,
            operator: "+",
            left: { type: NodeType.Identifier, value: "a" },
            right: { type: NodeType.Identifier, value: "b" }
          },
          right: {
            type: NodeType.InfixExpression,
            operator: "-",
            left: { type: NodeType.Identifier, value: "c" },
            right: { type: NodeType.Identifier, value: "d" }
          }
        },
        statements: [
          {
            type: NodeType.QubitDeclaration,
            identifier: "q",
            state: "|0>"
          }
        ]
      },
    ]);
  });
/*
  test('should add an error for malformed if condition', () => {
    const tokens = lexer.tokenize("if a < { gate H => q; };");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 6) Expected one of NUMBER, IMAGINARY, IDENTIFIER, MINUS, PLUS, got LBRACE"]);
    expect(program.statements).toHaveLength(0);
  });

  /*
  test('should parse complex number with identifier in matrix', () => {
    const tokens = lexer.tokenize("define gate X as matrix { [a + bi, c] };");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MatrixGateDefinition,
        identifier: "X",
        matrix: {
          type: NodeType.Matrix,
          rows: [
            {
              type: NodeType.MatrixRow,
              values: [
                {
                  type: NodeType.ComplexExpression,
                  left: {
                    type: NodeType.ComplexNumber,
                    real: { type: NodeType.RealExpression, left: { type: NodeType.Identifier, value: "a" }, right: null },
                    imaginary: { type: NodeType.RealExpression, left: { type: NodeType.Identifier, value: "b" }, right: null }
                  },
                  right: null
                },
                {
                  type: NodeType.ComplexExpression,
                  left: { type: NodeType.Identifier, value: "c" },
                  right: null
                }
              ]
            }
          ]
        }
      }
    ]);
  });

  test('should parse multiple valid statements', () => {
    const tokens = lexer.tokenize("qubit q = |1>; gate H => q; measure q => r; print r;");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(4);
    expect(program.statements).toStrictEqual([
      { type: NodeType.QubitDeclaration, identifier: "q", state: "|1>" },
      {
        type: NodeType.GateApplication,
        gateIdentifier: "H",
        targets: [{ type: NodeType.Target, identifier: "q", index: null, secondIdentifier: null }]
      },
      {
        type: NodeType.MeasureStatement,
        target: { type: NodeType.Target, identifier: "q", index: null, secondIdentifier: null },
        resultIdentifier: "r"
      },
      { type: NodeType.PrintStatement, identifier: "r" }
    ]);
  });

  test('should handle prefix and infix with identifiers in if condition', () => {
    const tokens = lexer.tokenize("if -a + b <= c * d { print q; };");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.IfStatement,
        condition: {
          type: NodeType.Condition,
          expression: {
            type: NodeType.ComplexExpression,
            left: {
              type: NodeType.InfixExpression,
              op: "<=",
              left: {
                type: NodeType.InfixExpression,
                op: "+",
                left: { type: NodeType.PrefixExpression, op: "-", right: { type: NodeType.Identifier, value: "a" } },
                right: { type: NodeType.Identifier, value: "b" }
              },
              right: {
                type: NodeType.InfixExpression,
                op: "*",
                left: { type: NodeType.Identifier, value: "c" },
                right: { type: NodeType.Identifier, value: "d" }
              }
            },
            right: null
          }
        },
        body: [
          { type: NodeType.PrintStatement, identifier: "q" }
        ]
      }
    ]);
  });

  test('should add an error for missing semicolon', () => {
    const tokens = lexer.tokenize("print q");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 7) Expected one of SEMICOLON, got EOF"]);
    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for invalid qubit state', () => {
    const tokens = lexer.tokenize("qubit q = |2>;");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["(1, 11) Invalid qubit state 2"]);
    expect(program.statements).toHaveLength(0);
  });

  test('should parse matrix with numbers and null fields', () => {
    const tokens = lexer.tokenize("define gate H as matrix { [1, 1 + 2i; 1, -1] };");
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);
    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MatrixGateDefinition,
        identifier: "H",
        matrix: {
          type: NodeType.Matrix,
          rows: [
            {
              type: NodeType.MatrixRow,
              values: [
                { type: NodeType.ComplexExpression, left: { type: NodeType.RealNumber, value: 1, isNegative: null }, right: null },
                {
                  type: NodeType.ComplexExpression,
                  left: {
                    type: NodeType.ComplexNumber,
                    real: { type: NodeType.RealExpression, left: { type: NodeType.RealNumber, value: 1, isNegative: null }, right: null },
                    imaginary: { type: NodeType.RealExpression, left: { type: NodeType.RealNumber, value: 2, isNegative: null }, right: null }
                  },
                  right: null
                }
              ]
            },
            {
              type: NodeType.MatrixRow,
              values: [
                { type: NodeType.ComplexExpression, left: { type: NodeType.RealNumber, value: 1, isNegative: null }, right: null },
                { type: NodeType.ComplexExpression, left: { type: NodeType.PrefixExpression, op: "-", right: { type: NodeType.RealNumber, value: 1, isNegative: null } }, right: null }
              ]
            }
          ]
        }
      }
    ]);
  });*/
});