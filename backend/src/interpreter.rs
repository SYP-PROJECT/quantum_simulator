use std::collections::HashMap;

use crate::{
    models::{ProgramNode, StatementNode},
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
    None
}

