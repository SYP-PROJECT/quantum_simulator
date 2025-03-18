use nalgebra::{Complex, DMatrix, DVector, Matrix2};
use rand::Rng;
use crate::qubit::Measurement;

pub struct QuantumRegister {
    state: DVector<Complex<f64>>
}

fn tensor_product(a: &DMatrix<Complex<f64>>, b: &DMatrix<Complex<f64>>) -> DMatrix<Complex<f64>>{
    let mut result = DMatrix::zeros(a.nrows() * b.nrows(), a.ncols() * b.ncols());

    for i in 0..a.nrows(){
        for j in 0..a.ncols()  {
            for k in 0..b.nrows() {
                for l in 0..b.ncols(){
                    result[(i * b.nrows() + k, j * b.ncols() + l)] = a[(i, j)] * b[(k, l)];
                }
            }
        }
    }
    result
}

impl QuantumRegister{
    pub fn new(num_qubits: usize) -> Self{
        let mut state = DVector::zeros(1 << num_qubits);
        state[0] = Complex::new(1.0, 0.0);
        QuantumRegister {state}
    }

    pub fn apply_gate(&mut self, gate_matrix: &DMatrix<Complex<f64>>, targets: &[usize]){
        let num_qubits = self.state.len().trailing_zeros() as usize;
        let mut full_matrix = DMatrix::identity(1 << num_qubits, 1 << num_qubits);

        for &target in targets {
            let mut gate_on_target = DMatrix::identity(1, 1);
            for i in 0..num_qubits {
                if i == target {
                    gate_on_target = tensor_product(&gate_on_target, gate_matrix);
                } else {
                    gate_on_target = tensor_product(&gate_on_target, &Matrix2::identity());
                }
            }
            full_matrix = full_matrix * gate_on_target;
        }

        self.state *= full_matrix;
    }

    pub fn measure(&mut self, qubit_index: usize) -> Measurement {
        let mut rng = rand::thread_rng();
        let random_num = rng.gen_range(0.0_f64..1.0);
        let prob_0 = self.state.iter().step_by(1 << qubit_index).map(|x| x.norm_sqr()).sum();

        if random_num < prob_0 {
            for i in 0..self.state.len() {
                if (i >> qubit_index) & 1 == 1 {
                    self.state[i] = Complex::new(0.0, 0.0);
                }
            }
            self.state.normalize_mut();
            0
        } else {
            for i in 0..self.state.len() {
                if (i >> qubit_index) & 1 == 0 {
                    self.state[i] = Complex::new(0.0, 0.0);
                }
            }
            self.state.normalize_mut();
            1
        }
    }
}