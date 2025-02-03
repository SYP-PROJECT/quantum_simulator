Tutorial: 
# Tutorial


### What are Qubits?

Imagine a qubit like a spinning coin. It can be heads, tails, or even both at the same time! This special "both at the same time" state is called superposition.

- If the coin is **heads**, we say the qubit is in state **|0⟩**.
- If the coin is **tails**, we say the qubit is in state **|1⟩**.
- But, sometimes the coin can be spinning, and we don't know if it will land heads or tails. That's like a qubit being in superposition, both **|0⟩** and **|1⟩** at the same time!

### Creating Qubits

To make a new qubit, we can say something like:
```
create qubit my_qubit = [0, 1];
```
This is like creating a new coin that starts out as heads (|0⟩) and tails (|1⟩).

### Measuring a Qubit

If you want to see if the qubit is heads or tails, you "measure" it:
```
measure my_qubit;
```
This will stop the spinning and tell you if it's heads or tails!

---

### Quantum Gates

Quantum gates are like magic tricks you can do with the qubit.

#### 1. Identity Gate
This gate doesn't change the qubit. It's like doing nothing to the coin:

$$
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

#### 2. Pauli-X Gate
This gate flips the qubit, just like flipping the coin:

$$
\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
$$

#### 3. Pauli-Y Gate
This gate does a special flip with a twist! It changes **|0⟩** to a special version of **|1⟩** (with an "i" twist) and **|1⟩** to a special version of **|0⟩**:

$$
\begin{bmatrix}
0 & -i \\
i & 0
\end{bmatrix}
$$

#### 4. Pauli-Z Gate
This gate flips **|1⟩** to a negative **|1⟩**, but leaves **|0⟩** alone:

$$
\begin{bmatrix}
1 & 0 \\
0 & -1
\end{bmatrix}
$$

#### 5. Hadamard Gate
This gate makes the qubit spin in a way that has both heads and tails equally likely to happen when you measure it:

$$
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 & 1 \\
1 & -1
\end{bmatrix}
$$

---

### Applying Gates

To use a gate, you just tell the computer which qubit you want to change and which trick you want to do! Like this:
```
apply my_qubit, Pauli-X;
```
This flips your qubit, just like flipping a coin!

Now you're ready to play with qubits and make them do magic tricks!