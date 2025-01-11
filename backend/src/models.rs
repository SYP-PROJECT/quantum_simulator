use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
pub enum NodeType {
    Program,
    CreateStatement,
    ApplyStatement,
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
#[serde(tag = "type", rename_all = "PascalCase")]
pub enum StatementNode {
    CreateStatement {
        identifier: String,

        #[serde(rename = "complexArray")]
        complex_array: ComplexArrayNode,
    },
    ApplyStatement {
        identifier1: String,
        identifier2: String,
    },
    MeasureStatement {
        identifier: String,
    },
    DisplayStatement {
        identifier: String,
    },
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
