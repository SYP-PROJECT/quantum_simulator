use nalgebra::Complex;
use nalgebra::Matrix2;

pub trait Gate {
    fn matrix_representation(&self) -> Matrix2<Complex<f64>>;
}

pub struct Identity {
    matrix_form: Matrix2<Complex<f64>>,
}

impl Identity {
    pub fn new() -> Self {
        Self {
            matrix_form: Matrix2::new(
                Complex::new(1.0, 0.0),
                Complex::new(0.0, 0.0),
                Complex::new(0.0, 0.0),
                Complex::new(1.0, 0.0),
            ),
        }
    }
}

impl Gate for Identity {
    fn matrix_representation(&self) -> Matrix2<Complex<f64>> {
        self.matrix_form
    }
}

pub struct PauliX {
    matrix_form: Matrix2<Complex<f64>>,
}

impl PauliX {
    pub fn new() -> Self {
        Self {
            matrix_form: Matrix2::new(
                Complex::new(0.0, 0.0),
                Complex::new(1.0, 0.0),
                Complex::new(1.0, 0.0),
                Complex::new(0.0, 0.0),
            ),
        }
    }
}

impl Gate for PauliX {
    fn matrix_representation(&self) -> Matrix2<Complex<f64>> {
        self.matrix_form
    }
}

pub struct PauliY {
    matrix_form: Matrix2<Complex<f64>>,
}

impl PauliY {
    pub fn new() -> Self {
        Self {
            matrix_form: Matrix2::new(
                Complex::new(0.0, 0.0),
                Complex::new(0.0, -1.0),
                Complex::new(0.0, 1.0),
                Complex::new(0.0, 0.0),
            ),
        }
    }
}

impl Gate for PauliY {
    fn matrix_representation(&self) -> Matrix2<Complex<f64>> {
        self.matrix_form
    }
}

pub struct PauliZ {
    matrix_form: Matrix2<Complex<f64>>,
}

impl PauliZ {
    pub fn new() -> Self {
        Self {
            matrix_form: Matrix2::new(
                Complex::new(1.0, 0.0),
                Complex::new(0.0, 0.0),
                Complex::new(0.0, 0.0),
                Complex::new(-1.0, 0.0),
            ),
        }
    }
}

impl Gate for PauliZ {
    fn matrix_representation(&self) -> Matrix2<Complex<f64>> {
        self.matrix_form
    }
}

pub struct Hadamard {
    matrix_form: Matrix2<Complex<f64>>,
}

impl Hadamard {
    pub fn new() -> Self {
        let mut matrix = Matrix2::new(
            Complex::new(1.0, 0.0),
            Complex::new(1.0, 0.0),
            Complex::new(1.0, 0.0),
            Complex::new(-1.0, 0.0),
        );

        matrix *= Complex::new(1.0 / (2.0_f64).sqrt(), 0.0);

        Self {
            matrix_form: matrix,
        }
    }
}

impl Gate for Hadamard {
    fn matrix_representation(&self) -> Matrix2<Complex<f64>> {
        self.matrix_form
    }
}

#[cfg(test)]
mod tests {
    use nalgebra::{ComplexField, Vector2};

    use crate::qubit::Qubit;

    use super::*;
    use float_cmp::assert_approx_eq;

    #[test]
    fn test_identity_gate() {
        let identity = Identity::new();

        let mut qubit = Qubit::basis0();
        qubit.apply_gate(&identity);
        assert_eq!(qubit.state(), Qubit::basis0().state());

        qubit = Qubit::basis1();
        qubit.apply_gate(&identity);
        assert_eq!(qubit.state(), Qubit::basis1().state());

        let mut qubit = Qubit::new_from_amplitudes(1.0, 1.0, 1.0, 1.0);
        qubit.apply_gate(&identity);
        assert_eq!(
            qubit.state(),
            Qubit::new_from_amplitudes(1.0, 1.0, 1.0, 1.0).state()
        );
    }

    #[test]
    fn test_pauli_x_gate() {
        let pauli_x = PauliX::new();

        let mut qubit = Qubit::basis0();
        qubit.apply_gate(&pauli_x);
        assert_eq!(qubit.state(), Qubit::basis1().state());

        let mut qubit = Qubit::basis1();
        qubit.apply_gate(&pauli_x);
        assert_eq!(qubit.state(), Qubit::basis0().state());
    }

    #[test]
    fn test_pauli_y_gate() {
        let pauli_y = PauliY::new();

        let mut qubit = Qubit::basis0();
        qubit.apply_gate(&pauli_y);
        assert_eq!(
            qubit.state(),
            Vector2::new(Complex::new(0.0, 0.0), Complex::new(0.0, 1.0))
        );

        qubit = Qubit::basis1();
        qubit.apply_gate(&pauli_y);
        assert_eq!(
            qubit.state(),
            Vector2::new(Complex::new(0.0, -1.0), Complex::new(0.0, 0.0))
        );
    }

    #[test]
    fn test_pauli_z_gate() {
        let pauli_z = PauliZ::new();

        let mut qubit = Qubit::basis0();
        qubit.apply_gate(&pauli_z);
        assert_eq!(qubit.state(), Qubit::basis0().state());

        qubit = Qubit::basis1();
        println!("{:?}", qubit);
        qubit.apply_gate(&pauli_z);
        println!("{:?}", qubit);

        assert_eq!(
            qubit.state(),
            Qubit::new_from_amplitudes(0.0, 0.0, -1.0, 0.0).state()
        );
    }

    #[test]
    fn test_hadamard_gate() {
        let hadamard = Hadamard::new();
        let inv_sqrt2 = 1.0_f64 / 2.0_f64.sqrt();
        let tolerance = 0.0;

        let mut qubit = Qubit::basis0();
        let mut expected_state = Qubit::new_from_amplitudes(inv_sqrt2, 0.0, inv_sqrt2, 0.0).state();
        qubit.apply_gate(&hadamard);

        assert_approx_eq!(f64, qubit.state().x.real(), expected_state.x.real());
        assert_approx_eq!(
            f64,
            qubit.state().x.imaginary(),
            expected_state.x.imaginary()
        );
        assert_approx_eq!(f64, qubit.state().y.real(), expected_state.y.real());
        assert_approx_eq!(
            f64,
            qubit.state().y.imaginary(),
            expected_state.y.imaginary()
        );

        qubit = Qubit::basis1();
        qubit.apply_gate(&hadamard);
        expected_state = Qubit::new_from_amplitudes(inv_sqrt2, 0.0, -inv_sqrt2, 0.0).state();

        assert_approx_eq!(f64, qubit.state().x.real(), expected_state.x.real());
        assert_approx_eq!(
            f64,
            qubit.state().x.imaginary(),
            expected_state.x.imaginary()
        );
        assert_approx_eq!(f64, qubit.state().y.real(), expected_state.y.real());
        assert_approx_eq!(
            f64,
            qubit.state().y.imaginary(),
            expected_state.y.imaginary()
        );
    }
}
