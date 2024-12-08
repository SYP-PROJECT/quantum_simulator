use std::collections::HashMap;

use crate::{
    gate::{Gate, Hadamard, Identity, PauliX, PauliY, PauliZ},
    models::{ComplexNumberNode, NodeType, ProgramNode, StatementNode},
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

        StatementNode::Apply(apply_statement) => {
            let qubit_identifier = apply_statement.identifier1;
            let gate_identifier = apply_statement.identifier2;

            if !variables.contains_key(&qubit_identifier) {
                return Some(format!("Cannot resolve symbol '{}'", qubit_identifier));
            }

            if !gates.contains_key(&gate_identifier) {
                return Some(format!("Cannot resolve gate '{}'", gate_identifier));
            }

            let qubit = variables.get_mut(&qubit_identifier).unwrap();
            let gate = gates.get_mut(&gate_identifier).unwrap();

            qubit.apply_gate(&**gate);

            None
        }
        StatementNode::Measure(measure_statement)
            if measure_statement.r#type == NodeType::MeasureStatement =>
        {
            let identifier = measure_statement.identifier;

            if !variables.contains_key(&identifier) {
                Some(format!("Cannot resolve symbol '{}'", identifier))
            } else {
                Some(format!(
                    "Result of measurment: {}",
                    variables.get_mut(&identifier).unwrap().measure()
                ))
            }
        }

        StatementNode::Measure(measure_statement)
            if measure_statement.r#type == NodeType::DisplayStatement =>
        {
            let identifier = measure_statement.identifier;

            if !variables.contains_key(&identifier) {
                Some(format!("Cannot resolve symbol '{}'", identifier))
            } else {
                Some(format!(
                    "{}: {:?}",
                    identifier,
                    variables.get_mut(&identifier).unwrap()
                ))
            }
        }

        _ => Some(format!("Unknown node type: {:?}", statement)),
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
