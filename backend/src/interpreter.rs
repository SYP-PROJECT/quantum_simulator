use std::collections::HashMap;

use crate::{
    gate::{Gate, Hadamard, Identity, PauliX, PauliY, PauliZ},
    models::{Expression, ProgramNode, StatementNode},
    qubit::Qubit,
};

pub fn interpret_program(program: ProgramNode) -> Vec<String> {
    let mut results = vec![];
    let mut variables: HashMap<String, Qubit> = HashMap::new();
    let mut gates: HashMap<String, Box<dyn Gate>> = HashMap::new();
    initialize_gate_map(&mut gates);

    for statement in program.statements {
        let result = interpret_statement(statement, &mut variables, &mut gates);

        if let Some(result) = result {
            results.push(result);
        }
    }

    results
}

fn interpret_statement(
    statement: StatementNode,
    variables: &mut HashMap<String, Qubit>,
    gates: &mut HashMap<String, Box<dyn Gate>>,
) -> Option<String> {
    match statement {
        StatementNode::CreateStatement {
            identifier,
            complex_array,
        } => {
            if let std::collections::hash_map::Entry::Vacant(e) =
                variables.entry(identifier.to_string())
            {
                if complex_array.values.len() != 2 {
                    return Some(format!(
                        "Invalid number of states for qubit {}: expected 2, got {}",
                        identifier,
                        complex_array.values.len()
                    ));
                }

                let (real1, imag1) = evaluate_complex_expression(&complex_array.values[0]);
                let (real2, imag2) = evaluate_complex_expression(&complex_array.values[1]);

                let qubit = Qubit::new_from_amplitudes(real1, imag1, real2, imag2);
                e.insert(qubit);
                None
            } else {
                Some(format!("Identifier {} was already declared", identifier))
            }
        }

        StatementNode::ApplyStatement {
            identifier1,
            identifier2,
        } => {
            if !variables.contains_key(&identifier1) {
                return Some(format!("Cannot resolve symbol '{}'", identifier1));
            }

            if !gates.contains_key(&identifier2) {
                return Some(format!("Cannot resolve gate '{}'", identifier2));
            }

            let qubit = variables.get_mut(&identifier1).unwrap();
            let gate = gates.get_mut(&identifier2).unwrap();

            qubit.apply_gate(&**gate);

            None
        }

        StatementNode::MeasureStatement { identifier } => {
            if !variables.contains_key(&identifier) {
                Some(format!("Cannot resolve symbol '{}'", identifier))
            } else {
                Some(format!(
                    "Result of measurement: {}",
                    variables.get_mut(&identifier).unwrap().measure()
                ))
            }
        }

        StatementNode::DisplayStatement { identifier } => {
            if variables.contains_key(&identifier) {
                Some(format!(
                    "{}: {:?}",
                    identifier,
                    variables.get_mut(&identifier).unwrap()
                ))
            } else if gates.contains_key(&identifier) {
                Some(format!(
                    "{}: {:?}",
                    identifier,
                    gates.get_mut(&identifier).unwrap()
                ))
            } else {
                Some(format!("Cannot resolve symbol '{}'", identifier))
            }
        }
    }
}

fn evaluate_complex_expression(expr: &Expression) -> (f64, f64) {
    match expr {
        Expression::RealNumber { value } => (*value, 0.0),
        Expression::ImaginaryNumber { value } => (0.0, *value),
        Expression::InfixExpression { op, left, right } => {
            let (left_real, left_imag) = evaluate_complex_expression(left);
            let (right_real, right_imag) = evaluate_complex_expression(right);

            match op.as_str() {
                "+" => (left_real + right_real, left_imag + right_imag),
                "-" => (left_real - right_real, left_imag - right_imag),
                "*" => (
                    left_real * right_real - left_imag * right_imag,
                    left_real * right_imag + left_imag * right_real,
                ),
                "/" => {
                    let denominator = right_real * right_real + right_imag * right_imag;
                    (
                        (left_real * right_real + left_imag * right_imag) / denominator,
                        (left_imag * right_real - left_real * right_imag) / denominator,
                    )
                }
                _ => (0.0, 0.0),
            }
        }
        Expression::PrefixExpression { op, right } => {
            let (real, imag) = evaluate_complex_expression(right);
            match op.as_str() {
                "-" => (-real, -imag),
                _ => (real, imag),
            }
        }
    }
}

fn initialize_gate_map(hashmap: &mut HashMap<String, Box<dyn Gate>>) {
    hashmap.insert("identity".to_string(), Box::new(Identity::new()));
    hashmap.insert("pauliX".to_string(), Box::new(PauliX::new()));
    hashmap.insert("pauliY".to_string(), Box::new(PauliY::new()));
    hashmap.insert("pauliZ".to_string(), Box::new(PauliZ::new()));
    hashmap.insert("hadamard".to_string(), Box::new(Hadamard::new()));
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{ComplexArrayNode, Expression, NodeType, ProgramNode, StatementNode};

    fn create_real_number(value: f64) -> Expression {
        Expression::RealNumber { value }
    }

    fn create_imaginary_number(value: f64) -> Expression {
        Expression::ImaginaryNumber { value }
    }

    #[test]
    fn test_create_qubit_wrong_states_count() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::CreateStatement {
                identifier: "q1".to_string(),
                complex_array: ComplexArrayNode {
                    r#type: NodeType::ComplexArray,
                    values: vec![
                        create_real_number(1.0),
                        create_real_number(0.0),
                        create_real_number(0.0),
                    ],
                },
            }],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Invalid number of states for qubit q1: expected 2, got 3",
            "Expected error for wrong number of states"
        );
    }

    #[test]
    fn test_create_qubit_empty_states() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::CreateStatement {
                identifier: "q1".to_string(),
                complex_array: ComplexArrayNode {
                    r#type: NodeType::ComplexArray,
                    values: vec![],
                },
            }],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Invalid number of states for qubit q1: expected 2, got 0",
            "Expected error for empty states"
        );
    }

    #[test]
    fn test_create_qubit_success() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::CreateStatement {
                identifier: "q1".to_string(),
                complex_array: ComplexArrayNode {
                    r#type: NodeType::ComplexArray,
                    values: vec![create_real_number(1.0), create_real_number(0.0)],
                },
            }],
        };

        let results = interpret_program(program);

        assert!(
            results.is_empty(),
            "Expected no errors when creating a qubit"
        );
    }

    #[test]
    fn test_create_qubit_duplicate_identifier() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![create_real_number(1.0), create_real_number(0.0)],
                    },
                },
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![create_real_number(0.0), create_real_number(1.0)],
                    },
                },
            ],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Identifier q1 was already declared",
            "Expected error for duplicate identifier"
        );
    }

    #[test]
    fn test_apply_gate_success() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![create_real_number(1.0), create_real_number(0.0)],
                    },
                },
                StatementNode::ApplyStatement {
                    identifier1: "q1".to_string(),
                    identifier2: "pauliX".to_string(),
                },
            ],
        };

        let results = interpret_program(program);

        assert!(
            results.is_empty(),
            "Expected no errors when applying a gate"
        );
    }

    #[test]
    fn test_apply_gate_unknown_qubit() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::ApplyStatement {
                identifier1: "q1".to_string(),
                identifier2: "pauliX".to_string(),
            }],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Cannot resolve symbol 'q1'",
            "Expected error for unknown qubit"
        );
    }

    #[test]
    fn test_apply_gate_unknown_gate() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![create_real_number(1.0), create_real_number(0.0)],
                    },
                },
                StatementNode::ApplyStatement {
                    identifier1: "q1".to_string(),
                    identifier2: "unknown_gate".to_string(),
                },
            ],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Cannot resolve gate 'unknown_gate'",
            "Expected error for unknown gate"
        );
    }

    #[test]
    fn test_measure_qubit_success() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![create_real_number(1.0), create_real_number(0.0)],
                    },
                },
                StatementNode::MeasureStatement {
                    identifier: "q1".to_string(),
                },
            ],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert!(results[0].starts_with("Result of measurement:"));
    }

    #[test]
    fn test_measure_qubit_unknown_identifier() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::MeasureStatement {
                identifier: "q1".to_string(),
            }],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Cannot resolve symbol 'q1'",
            "Expected error for unknown qubit in measurement"
        );
    }

    #[test]
    fn test_display_qubit() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![create_real_number(1.0), create_real_number(0.0)],
                    },
                },
                StatementNode::DisplayStatement {
                    identifier: "q1".to_string(),
                },
            ],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert!(results[0].contains("q1:"));
    }

    #[test]
    fn test_display_gate() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::DisplayStatement {
                identifier: "pauliX".to_string(),
            }],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert!(results[0].contains("pauliX:"));
    }

    #[test]
    fn test_display_unknown_identifier() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::DisplayStatement {
                identifier: "unknown".to_string(),
            }],
        };

        let results = interpret_program(program);

        assert_eq!(results.len(), 1);
        assert_eq!(
            results[0], "Cannot resolve symbol 'unknown'",
            "Expected error for unknown identifier in display"
        );
    }

    #[test]
    fn test_complex_expression_creation() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::CreateStatement {
                identifier: "q1".to_string(),
                complex_array: ComplexArrayNode {
                    r#type: NodeType::ComplexArray,
                    values: vec![
                        Expression::InfixExpression {
                            op: "+".to_string(),
                            left: Box::new(create_real_number(1.0)),
                            right: Box::new(create_imaginary_number(1.0)),
                        },
                        Expression::InfixExpression {
                            op: "-".to_string(),
                            left: Box::new(create_real_number(0.0)),
                            right: Box::new(create_imaginary_number(1.0)),
                        },
                    ],
                },
            }],
        };

        let results = interpret_program(program);
        assert!(
            results.is_empty(),
            "Expected no errors when creating qubit with complex expressions"
        );
    }
}
