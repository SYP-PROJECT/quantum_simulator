use std::collections::HashMap;

use crate::{
    models::{ComplexNumberNode, ProgramNode, StatementNode},
    qubit::Qubit,
};

pub fn interpret_program(program: ProgramNode) -> Vec<String> {
    let mut results = vec![];
    let mut variables: HashMap<String, Qubit> = HashMap::new();

    for statement in program.statements {
        let result = interpret_statement(statement, &mut variables);

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
) -> Option<String> {
    match statement {
        StatementNode::Create(create_statement) => {
            let identifier = create_statement.identifier;
            if variables.contains_key(&identifier) {
                Some(format!("Identifier {} was already declared", identifier))
            } else {
                let complex_array = create_statement.complex_array;
                let complex1 = &complex_array.values[0];
                let complex2 = &complex_array.values[1];

                let qubit = Qubit::new_from_amplitudes(
                    get_real_part(complex1),
                    get_imaginary_part(complex1),
                    get_real_part(complex2),
                    get_imaginary_part(complex2),
                );

                variables.insert(identifier, qubit);
                None
            }
        }
        //StatementNode::Connect(_) => None,
        StatementNode::Measure(measure_statement) => {
            let identifier = measure_statement.identifier;

            if !variables.contains_key(&identifier) {
                Some(format!("Cannot resolve symbol '{}'", identifier))
            } else {
                Some(format!("Result of measurment: {}", variables.get_mut(&identifier).unwrap().measure()))
            }
        }

        //StatementNode::Display(_) => None,
        _ => Some(format!("Unknown node type: "))
    }
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
