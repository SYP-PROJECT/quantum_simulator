use std::fmt::{ Debug, Formatter, Pointer};
use float_cmp::approx_eq;
use nalgebra::{SVector, Vector2};

pub struct Qubit {
    a: f64,
    b: f64,
    vector_representation: SVector<f64, 2>
}

impl Qubit {
    pub fn new(a: f64, b: f64) -> Option<Self> {
        let amplitude = (a.powi(2) + b.powi(2)).sqrt();

        if !approx_eq!(f64, amplitude, 1.0, ulps = 2) {
            println!("Invalid probability amplitudes.");
            return None;
        }

        Some(Qubit { a, b, vector_representation: Vector2::new(a, b) })
    }
}

impl Debug for Qubit {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.vector_representation)
    }
}
