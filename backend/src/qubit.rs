use nalgebra::{Complex, Vector2};
use rand::prelude::*;
use std::fmt::{Debug, Formatter};

use crate::gate::Gate;

pub type Measurment = u8;

pub struct Qubit {
    state: Vector2<Complex<f64>>,
}

impl Qubit {
    pub fn new() -> Self {
        Self {
            state: Vector2::new(Complex::new(1.0, 0.0), Complex::new(0.0, 0.0)),
        }
    }

    pub fn basis0() -> Self {
        Self::new()
    }

    pub fn basis1() -> Self {
        Self::new_from_vec(Vector2::new(Complex::new(0.0, 0.0), Complex::new(1.0, 0.0)))
    }

    pub fn new_from_vec(state: Vector2<Complex<f64>>) -> Self {
        Self {
            state: state.normalize(),
        }
    }

    pub fn apply_gate(&mut self, gate: &impl Gate) {
        self.state = gate.matrix_representation() * self.state;
    }

    pub fn measure(&mut self) -> Measurment {
        let mut rng = rand::thread_rng();
        let random_num = rng.gen_range(0.0_f64..1.0);
        let prob_0 = self.state[0].norm_sqr();

        if random_num < prob_0 {
            self.state = Vector2::new(Complex::new(1.0, 0.0), Complex::new(0.0, 0.0));
            0
        } else {
            self.state = Vector2::new(Complex::new(0.0, 0.0), Complex::new(1.0, 0.0));
            1
        }
    }
}

impl Debug for Qubit {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "{:?}", self.state)
    }
}
