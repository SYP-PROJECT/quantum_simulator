use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
enum NodeType {
    Program,
    CreateStatement,
    ConnectStatement,
    ComplexArray,
    ComplexNumber,
    Number,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProgramNode {
    r#type: NodeType,
    statements: Vec<StatementNode>,
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
enum StatementNode {
    Create(),
    Connect(),
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct CreateStatementNode {
    r#type: NodeType,
    identifier: String,
    complex_array: ComplexArrayNode,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ConnectStatementNode {
    r#type: NodeType,
    identifier1: String,
    identifier2: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ComplexArrayNode {
    r#type: NodeType,
    values: Vec<ComplexNumberNode>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct ComplexNumberNode {
    r#type: NodeType,
    real_part: Option<NumberNode>,
    imaginary_part: Option<NumberNode>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct NumberNode {
    r#type: NodeType,
    value: f64,
}
