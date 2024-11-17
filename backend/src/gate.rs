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
                Complex::new(0.0, -1.0),
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

        matrix = matrix * Complex::new(1.0 / (2.0_f64).sqrt(), 0.0);

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
