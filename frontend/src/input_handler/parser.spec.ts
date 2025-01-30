import {Parser} from "./parser";
import {Lexer} from "./lexer";
import {NodeType} from "./ast";

describe('Parser', () => {
  const lexer = new Lexer();
  const parser = new Parser();

  test('should initialize the parser with a lexer', () => {
    expect(() => parser.reset(lexer)).not.toThrow();
  });

  test('should parse an empty program', () => {
    lexer.reset("");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(program.statements).toHaveLength(0);
  });

  test('should parse a simple MEASURE statement', () => {
    lexer.reset("measure q;");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        identifier: "q"
      }
    ]);
  });

  test('should throw an error for an unexpected token', () => {
    lexer.reset("INVALID");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual([
      "Only creation, measurement, apply and display can be used as statements"
    ]);

    expect(program.statements).toHaveLength(0);
  });


  test('should resynchronize after encountering an error', () => {
    lexer.reset("INVALID; measure q1;");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual([
      "Only creation, measurement, apply and display can be used as statements"
    ]);

    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        identifier: "q1"
      }
    ]);
  });

  test('should resynchronize on eof', () => {
    lexer.reset("INVALID; measure q1; INVALID measure q1");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(2);
    expect(parser.Errors).toStrictEqual([
      "Only creation, measurement, apply and display can be used as statements",
      "Only creation, measurement, apply and display can be used as statements"
    ]);

    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        identifier: "q1"
      }
    ]);
  });

  test('should add an error for an unexpected token type', () => {
    lexer.reset("measure;");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be IDENTIFIER, got SEMICOLON instead"]);

    expect(program.type).toBe(NodeType.Program);
    expect(program.statements).toHaveLength(0);
  });

  test('should parse a simple DISPLAY statement', () => {
    lexer.reset("display q;");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.DisplayStatement,
        identifier: "q"
      }
    ]);
  });

  test('should parse a simple APPLY statement', () => {
    lexer.reset("apply q1, q2;");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);
    expect(program.statements).toStrictEqual([
      {
        type: NodeType.ApplyStatement,
        identifier1: "q1",
        identifier2: "q2"
      }
    ]);
  });

  test('should add an error for a missing first identifier in APPLY statement', () => {
    lexer.reset("apply , q2;");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be IDENTIFIER, got COMMA instead"]);

    expect(program.statements).toHaveLength(0);
  });



  test('should add an error for a missing second identifier in APPLY statement', () => {
    lexer.reset("apply q1,;");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be IDENTIFIER, got SEMICOLON instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing comma in APPLY statement', () => {
    lexer.reset("apply q1 q2;");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be COMMA, got IDENTIFIER instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing semicolon in APPLY statement', () => {
    lexer.reset("apply q1, q2");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be SEMICOLON, got EOF instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should parse CREATE statement with no values', () => {
    lexer.reset("create qubit q1 = [];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: []
        }
      }
    ]);
  });

  test('should parse CREATE statement with real number', () => {
    lexer.reset("create qubit q1 = [1];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [{type: NodeType.RealNumber, value: 1}]
        }
      }
    ]);
  });

  test('should parse CREATE statement with multiple real numbers', () => {
    lexer.reset("create qubit q1 = [1, 2, 3, 4, 5];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [
              {type: NodeType.RealNumber, value: 1},
              {type: NodeType.RealNumber, value: 2},
              {type: NodeType.RealNumber, value: 3},
              {type: NodeType.RealNumber, value: 4},
              {type: NodeType.RealNumber, value: 5}
          ]
        }
      }
    ]);
  });

  test('should parse CREATE statement with imaginary number', () => {
    lexer.reset("create qubit q1 = [1i];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [
            {type: NodeType.ImaginaryNumber, value: 1}
          ]
        }
      }
    ]);
  });

  test('should parse CREATE statement with mutiple imaginary number', () => {
    lexer.reset("create qubit q1 = [1i, 2i, 3i, 4i, 5i];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [
            {type: NodeType.ImaginaryNumber, value: 1},
            {type: NodeType.ImaginaryNumber, value: 2},
            {type: NodeType.ImaginaryNumber, value: 3},
            {type: NodeType.ImaginaryNumber, value: 4},
            {type: NodeType.ImaginaryNumber, value: 5}
          ]
        }
      }
    ]);
  });

  test('should parse CRATE statement with mixed imaginary number', () => {
    lexer.reset("create qubit q1 = [1i, 2, 3, 4, 5i];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [
            {type: NodeType.ImaginaryNumber, value: 1},
            {type: NodeType.RealNumber, value: 2},
            {type: NodeType.RealNumber, value: 3},
            {type: NodeType.RealNumber, value: 4},
            {type: NodeType.ImaginaryNumber, value: 5}
          ]
        }
      }
    ]);
  });

  test('should parse CRATE statement with prefix expression', () => {
    lexer.reset("create qubit q1 = [-1, +2, -3i, +4i];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(1);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.CreateStatement,
        identifier: "q1",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [
            {type: NodeType.PrefixExpression, op: "-", right: {type: NodeType.RealNumber, value: 1}},
            {type: NodeType.PrefixExpression, op: "+", right: {type: NodeType.RealNumber, value: 2}},
            {type: NodeType.PrefixExpression, op: "-", right: {type: NodeType.ImaginaryNumber, value: 3}},
            {type: NodeType.PrefixExpression, op: "+", right: {type: NodeType.ImaginaryNumber, value: 4}},
          ]
        }
      }
    ]);
  });

  test('should add an error for missing qubit in CREATE statement', () => {
    lexer.reset("create q1 = [1];");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be QUBIT, got IDENTIFIER instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing identifier in CREATE statement', () => {
    lexer.reset("create qubit = [1];");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be IDENTIFIER, got EQUALS instead"]);

    expect(program.statements).toHaveLength(0);
  });


  test('should add an error for missing equal sign in CREATE statement', () => {
    lexer.reset("create qubit q1 [1];");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be EQUALS, got LBRACKET instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing left bracket in CREATE statement', () => {
    lexer.reset("create qubit q1 = 1];");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be LBRACKET, got NUMBER instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing COMMA in CREATE statement', () => {
    lexer.reset("create qubit q1 = [1 2];");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be RBRACKET, got NUMBER instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing rbracket in CREATE statement', () => {
    lexer.reset("create qubit q1 = [1;");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be RBRACKET, got SEMICOLON instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing semicolon in CREATE statement', () => {
    lexer.reset("create qubit q1 = [1]");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["Expected next token to be SEMICOLON, got EOF instead"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should add an error for missing number in PREFIX expression', () => {
    lexer.reset("create qubit q1 = [-];");
    parser.reset(lexer);

    const program = parser.parseProgram();

    expect(parser.Errors.length).toBe(1);
    expect(parser.Errors).toStrictEqual(["No prefix parse function for RBRACKET found"]);

    expect(program.statements).toHaveLength(0);
  });

  test('should parse multiple valid statements', () => {
    lexer.reset("measure q1; display q1; create qubit a = [1];");
    parser.reset(lexer);

    const program = parser.parseProgram();
    expect(parser.Errors.length).toBe(0);

    expect(program.statements).toHaveLength(3);

    expect(program.statements).toStrictEqual([
      {
        type: NodeType.MeasureStatement,
        identifier: "q1"
      },
      {
        type: NodeType.DisplayStatement,
        identifier: "q1"
      },
      {
        type: NodeType.CreateStatement,
        identifier: "a",
        complexArray: {
          type: NodeType.ComplexArray,
          values: [
              {type: NodeType.RealNumber, value: 1},
          ]
        }
      }
    ]);
  });
});
