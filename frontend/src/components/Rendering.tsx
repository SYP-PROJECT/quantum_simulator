import React from 'react';
import QuantumCircuit from './QuantumCircuit';
import { ProgramNode } from '@/input_handler/ast';

interface QuantumCircuitComponentProps {
  programNode: ProgramNode | null;
}

const QuantumCircuitComponent: React.FC<QuantumCircuitComponentProps> = ({ programNode }) => {
  return (
    <div className='quantum-container'>
      {programNode && <QuantumCircuit program={programNode} />}
    </div>
  );
};

export default QuantumCircuitComponent;
