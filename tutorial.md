Tutorial: 
# Tutorial

## Qubits and Superposition

Every qubit is represented by a linear combination of states (we say that the qubit is in superposition).  
Formally:  
**a|0⟩ + b|1⟩**,  
where **|0⟩** is the null basis and **|1⟩** is the first basis.  

### Note: Classical Bits
You can also represent classical bits using the same notation. The only difference is that instead of the superposition of states, you only have one state:  
- The state **|0⟩** for 0  
- The state **|1⟩** for 1  

---

## Creating Qubits

You can create a qubit in our simulation using the following syntax:  
```plaintext
create qubit name = [n1, n2];
```

You can measure a qubit using: 
```
measure q;
```

# Quantum Gates

## Overview

Quantum computers have gates, much like classical computers.

### Gates for One-Qubit Systems
These gates are represented by **2x2 matrices**:  

$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

Where **a**, **b**, **c**, and **d** are complex numbers.

---

## Classical Gates

You can also represent classical gates with matrices. For example, the classical **NOT gate** is represented by:  

$$
\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
$$

---

## Supported Quantum Gates

We currently support the following gates:

### 1. Identity Gate
Leaves a qubit unchanged:  

$$
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$

---

### 2. Pauli-X Gate
The quantum version of the classical NOT gate:  

$$
\begin{bmatrix}
0 & 1 \\
1 & 0
\end{bmatrix}
$$

---

### 3. Pauli-Y Gate
Maps **|0⟩** to **i|1⟩** and **|1⟩** to **-i|0⟩**:  

$$
\begin{bmatrix}
0 & -i \\
i & 0
\end{bmatrix}
$$

---

### 4. Pauli-Z Gate
Leaves **|0⟩** unchanged and maps **|1⟩** to **-|1⟩**:  

$$
\begin{bmatrix}
1 & 0 \\
0 & -1
\end{bmatrix}
$$

---

### 5. Hadamard Gate
Makes both states equally likely:  

$$
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1 & 1 \\
1 & -1
\end{bmatrix}
$$

---

## Applying Gates

Gates are applied using **matrix multiplication**.

In our simulator, you can apply a gate to a qubit using the following syntax:  
```plaintext
apply qubit_name, gate_name;
```
