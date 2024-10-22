use qubit::Qubit;

mod qubit;

fn main() {
    let _qubit1 = Qubit::new(1.0, 0.0);
    let _qubit2 = Qubit::new(0.0, 1.0);
    let _qubit3 = Qubit::new(3.0, 2.0);
    let _qubit4 = Qubit::new(1.0 / f64::sqrt(2.0), 1.0 / f64::sqrt(2.0));

    println!("{:?}", _qubit1);
    println!("{:?}", _qubit2);
    println!("{:?}", _qubit3);
    println!("{:?}", _qubit4);
}
