use std::collections::HashMap;

use crate::{
    gate::{Gate, Hadamard, Identity, PauliX, PauliY, PauliZ},
    models::{ComplexNumberNode, ProgramNode, StatementNode},
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
        } else {
            continue;
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
                let complex1 = &complex_array.values[0];
                let complex2 = &complex_array.values[1];
                let qubit = Qubit::new_from_amplitudes(
                    get_real_part(complex1),
                    get_imaginary_part(complex1),
                    get_real_part(complex2),
                    get_imaginary_part(complex2),
                );
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

fn initialize_gate_map(hashmap: &mut HashMap<String, Box<dyn Gate>>) {
    hashmap.insert("identity".to_string(), Box::new(Identity::new()));
    hashmap.insert("pauliX".to_string(), Box::new(PauliX::new()));
    hashmap.insert("pauliY".to_string(), Box::new(PauliY::new()));
    hashmap.insert("pauliZ".to_string(), Box::new(PauliZ::new()));
    hashmap.insert("hadamard".to_string(), Box::new(Hadamard::new()));
}

fn get_real_part(complex_node: &ComplexNumberNode) -> f64 {
    if complex_node.real_part.is_some() {
        return complex_node.real_part.as_ref().unwrap().value;
    }
    0.0
}

fn get_imaginary_part(complex_node: &ComplexNumberNode) -> f64 {
    if complex_node.imaginary_part.is_some() {
        return complex_node.imaginary_part.as_ref().unwrap().value;
    }
    0.0
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{
        ComplexArrayNode, ComplexNumberNode, NodeType, NumberNode, ProgramNode, StatementNode,
    };

    fn create_complex_number(real: f64, imaginary: f64) -> ComplexNumberNode {
        ComplexNumberNode {
            r#type: NodeType::Number,
            real_part: Some(NumberNode {
                r#type: NodeType::Number,
                value: real,
            }),
            imaginary_part: Some(NumberNode {
                r#type: NodeType::Number,
                value: imaginary,
            }),
        }
    }

    #[test]
    fn test_create_qubit_success() {
        let program = ProgramNode {
            r#type: NodeType::Program,
            statements: vec![StatementNode::CreateStatement {
                identifier: "q1".to_string(),
                complex_array: ComplexArrayNode {
                    r#type: NodeType::ComplexArray,
                    values: vec![
                        create_complex_number(1.0, 0.0),
                        create_complex_number(0.0, 0.0),
                    ],
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
                        values: vec![
                            create_complex_number(1.0, 0.0),
                            create_complex_number(0.0, 0.0),
                        ],
                    },
                },
                StatementNode::CreateStatement {
                    identifier: "q1".to_string(),
                    complex_array: ComplexArrayNode {
                        r#type: NodeType::ComplexArray,
                        values: vec![
                            create_complex_number(0.0, 0.0),
                            create_complex_number(1.0, 0.0),
                        ],
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
                        values: vec![
                            create_complex_number(1.0, 0.0),
                            create_complex_number(0.0, 0.0),
                        ],
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
                        values: vec![
                            create_complex_number(1.0, 0.0),
                            create_complex_number(0.0, 0.0),
                        ],
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
                        values: vec![
                            create_complex_number(1.0, 0.0),
                            create_complex_number(0.0, 0.0),
                        ],
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
                        values: vec![
                            create_complex_number(1.0, 0.0),
                            create_complex_number(0.0, 0.0),
                        ],
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
}
