// QubitTutorial.tsx
import React from 'react';

const QubitTutorial = () => {
  return (
    <div
      style={{
        flex: '0 0 30%',
        background: '#282a36',
        color: '#f8f8f2',
        padding: '20px',
        borderRadius: '5px',
        marginBottom: '20px',
        overflow: 'auto',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
      }}
    >
      <h2>Tutorial</h2>
      <h3>What are Qubits?</h3>
      <p>
        Imagine a qubit like a spinning coin. It can be heads, tails, or even both at the same time! This special (both at the same time) state is called superposition.
      </p>
      <ul>
        <li>
          If the coin is <strong>heads</strong>, we say the qubit is in state <strong>|0⟩</strong>.
        </li>
        <li>
          If the coin is <strong>tails</strong>, we say the qubit is in state <strong>|1⟩</strong>.
        </li>
        <li>
          But, sometimes the coin can be spinning, and we don’t know if it will land heads or tails. That is like a qubit being in superposition, both <strong>|0⟩</strong> and <strong>|1⟩</strong> at the same time!
        </li>
      </ul>

      <h3>Creating Qubits</h3>
      <pre>
        <code>create qubit my_qubit = [0, 1];</code>
      </pre>
      <p>
        This is like creating a new coin that starts out as heads (|0⟩) and tails (|1⟩).
      </p>

      <h3>Measuring a Qubit</h3>
      <pre>
        <code>measure my_qubit;</code>
      </pre>
      <p>This will stop the spinning and tell you if it is heads or tails!</p>

      <hr />

      <h3>Quantum Gates</h3>
      <p>Quantum gates are like magic tricks you can do with the qubit.</p>

      <h4>1. Identity Gate</h4>
      <pre className="math">
        <code>
          [ 1  0 ]<br />
          [ 0  1 ]
        </code>
      </pre>

      <h4>2. Pauli-X Gate</h4>
      <pre className="math">
        <code>
          [ 0  1 ]<br />
          [ 1  0 ]
        </code>
      </pre>

      <h4>3. Pauli-Y Gate</h4>
      <pre className="math">
        <code>
          [ 0  -i ]<br />
          [  i   0 ]
        </code>
      </pre>

      <h4>4. Pauli-Z Gate</h4>
      <pre className="math">
        <code>
          [ 1  0 ]<br />
          [ 0  -1 ]
        </code>
      </pre>

      <h4>5. Hadamard Gate</h4>
      <pre className="math">
        <code>
          1 / √2 [ 1  1 ]<br />
          [ 1  -1 ]
        </code>
      </pre>

      <hr />

      <h3>Applying Gates</h3>
      <pre>
        <code>apply my_qubit, Pauli-X;</code>
      </pre>
      <p>This flips your qubit, just like flipping a coin!</p>
    </div>
  );
};

export default QubitTutorial;
