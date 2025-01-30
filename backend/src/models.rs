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
    RealNumber,
    ImaginaryNumber,
    Number,
    InfixExpression,
    PrefixExpression,
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
    pub values: Vec<Expression>,
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type", rename_all = "PascalCase")]
pub enum Expression {
    RealNumber {
        value: f64,
    },
    ImaginaryNumber {
        value: f64,
    },
    InfixExpression {
        op: String,
        left: Box<Expression>,
        right: Box<Expression>,
    },
    PrefixExpression {
        op: String,
        right: Box<Expression>,
    },
}
