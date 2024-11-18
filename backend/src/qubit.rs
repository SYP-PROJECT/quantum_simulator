use nalgebra::{Complex, ComplexField, Vector2};
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

    pub fn new_from_amplitudes(r1: f64, i1: f64, r2: f64, i2: f64) -> Self {
        Self {
            state: Vector2::new(Complex::new(r1, i1), Complex::new(r2, i2)).normalize(),
        }
    }

    pub fn state(&self) -> Vector2<Complex<f64>> {
        self.state
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
        let number1 = if self.state.x.imaginary() >= 0.0 {
            format!("{}+{}i", self.state.x.real(), self.state.x.imaginary())
        } else {
            format!("{}-{}i", self.state.x.real(), self.state.x.imaginary())
        };

        let number2 = if self.state.y.imaginary() >= 0.0 {
            format!("{}+{}i", self.state.y.real(), self.state.y.imaginary())
        } else {
            format!("{}{}i", self.state.y.real(), self.state.y.imaginary())
        };

        write!(f, "[{}, {}]", number1, number2)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_qubit_initial_state() {
        let qubit = Qubit::new();
        assert_eq!(
            qubit.state(),
            Vector2::new(Complex::new(1.0, 0.0), Complex::new(0.0, 0.0))
        );
    }

    #[test]
    fn test_basis_states() {
        let basis0 = Qubit::basis0();
        let basis1 = Qubit::basis1();

        assert_eq!(
            basis0.state(),
            Vector2::new(Complex::new(1.0, 0.0), Complex::new(0.0, 0.0))
        );

        assert_eq!(
            basis1.state(),
            Vector2::new(Complex::new(0.0, 0.0), Complex::new(1.0, 0.0))
        );
    }

    #[test]
    fn test_normalized_state_creation() {
        let qubit = Qubit::new_from_amplitudes(1.0, 1.0, 1.0, 1.0);

        assert_eq!(qubit.state.norm(), 1.0);
        assert_eq!(
            qubit.state(),
            Vector2::new(Complex::new(0.5, 0.5), Complex::new(0.5, 0.5))
        );

        let qubit_vec =
            Qubit::new_from_vec(Vector2::new(Complex::new(1.0, 1.0), Complex::new(1.0, 1.0)));
        assert_eq!(qubit.state(), qubit_vec.state());
    }

    #[test]
    fn test_measurement_collapse() {
        for _ in 0..10000 {
            let mut qubit = Qubit::new_from_amplitudes(1.0, 0.0, 1.0, 0.0);
            let measurement = qubit.measure();

            match measurement {
                0 => assert_eq!(
                    qubit.state(),
                    Vector2::new(Complex::new(1.0, 0.0), Complex::new(0.0, 0.0))
                ),
                1 => assert_eq!(
                    qubit.state(),
                    Vector2::new(Complex::new(0.0, 0.0), Complex::new(1.0, 0.0))
                ),
                _ => panic!("Measurement should be either 0 or 1."),
            }
        }
    }

    #[test]
    fn test_debug_represantation() {
        assert_eq!(
            String::from("[0.5+0.5i, 0.5-0.5i]"),
            format!("{:?}", Qubit::new_from_amplitudes(1.0, 1.0, 1.0, -1.0))
        );
    }
}
