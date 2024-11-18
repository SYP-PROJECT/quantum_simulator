use gate::{Hadamard, Identity, PauliX};
use qubit::Qubit;

mod gate;
mod qubit;

fn main() {
    let mut qubit1 = Qubit::new();
    println!("{:?}", qubit1);

    let identity = Identity::new();
    qubit1.apply_gate(&identity);

    println!("{:?}", qubit1);

    let paulix = PauliX::new();
    qubit1.apply_gate(&paulix);
    println!("{:?}", qubit1);

    qubit1.apply_gate(&paulix);
    println!("{:?}", qubit1);

    let hadamard = Hadamard::new();
    qubit1.apply_gate(&hadamard);
    println!("{:?}", qubit1);
}
