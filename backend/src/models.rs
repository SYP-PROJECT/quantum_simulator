use serde::Deserialize;

#[derive(Deserialize, Debug, PartialEq)]
#[serde(rename_all = "PascalCase")]
pub enum NodeType {
    Program,
    CreateStatement,
    ConnectStatement,
    MeasureStatement,
    DisplayStatement,
    ComplexArray,
    ComplexNumber,
    Number,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProgramNode {
    pub r#type: NodeType,
    pub statements: Vec<StatementNode>,
}

#[derive(Deserialize, Debug)]
#[serde(untagged)]
pub enum StatementNode {
    Create(CreateStatementNode),
    Connect(ConnectStatementNode),
    Measure(MeasureStatementNode),
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CreateStatementNode {
    pub r#type: NodeType,
    pub identifier: String,
    pub complex_array: ComplexArrayNode,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ConnectStatementNode {
    pub r#type: NodeType,
    pub identifier1: String,
    pub identifier2: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MeasureStatementNode {
    pub r#type: NodeType,
    pub identifier: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ComplexArrayNode {
    pub r#type: NodeType,
    pub values: Vec<ComplexNumberNode>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ComplexNumberNode {
    pub r#type: NodeType,
    pub real_part: Option<NumberNode>,
    pub imaginary_part: Option<NumberNode>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NumberNode {
    pub r#type: NodeType,
    pub value: f64,
}
