import React, { useRef, useEffect } from 'react';
import { ProgramNode, NodeType } from '../input_handler/ast'
import * as d3 from 'd3';
import './QuantumCircuit.css';

const QuantumCircuit: React.FC<{ program: ProgramNode }> = ({ program }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';

      generateQuantumCircuit(program, containerRef.current);
    }
  }, [program]);

  return (
    <div className="quantum-circuit-container">
      <div ref={containerRef} className="quantum-circuit"></div>
    </div>
  );
};

function generateQuantumCircuit(program: ProgramNode, container: HTMLElement) {
  const width = 800;
  const height = 200;
  const qubitSpacing = 50;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const qubits = new Set<string>();

  program.statements.forEach(statement => {
    if (statement.type === NodeType.CreateStatement) {
      qubits.add(statement.identifier);
    }
  });

  const qubitList = Array.from(qubits);

  svg.selectAll(".qubit-line")
    .data(qubitList)
    .enter()
    .append("line")
    .attr("x1", 50)
    .attr("x2", width - 50)
    .attr("y1", (_, i) => 50 + i * qubitSpacing)
    .attr("y2", (_, i) => 50 + i * qubitSpacing)
    .attr("stroke", "white");

  svg.selectAll(".qubit-label")
    .data(qubitList)
    .enter()
    .append("text")
    .attr("x", 30)
    .attr("y", (_, i) => 50 + i * qubitSpacing)
    .attr("dy", "0.35em")
    .text(d => `q${d}`);

  let currentX = 100;
  program.statements.forEach(statement => {
    if (statement.type === NodeType.ApplyStatement) {
      const qubitIndex1 = qubitList.indexOf(statement.identifier1);
      const qubitIndex2 = qubitList.indexOf(statement.identifier2);

      const gate = svg.append("g");

      gate.append("rect")
        .attr("x", currentX)
        .attr("y", 50 + qubitIndex1 * qubitSpacing - 15)
        .attr("width", 30)
        .attr("height", (qubitIndex2 - qubitIndex1) * qubitSpacing + 30)
        .attr("fill", "lightblue");

      currentX += 50;
    } else if (statement.type === NodeType.MeasureStatement) {
      const qubitIndex = qubitList.indexOf(statement.identifier);

      svg.append("circle")
        .attr("cx", currentX)
        .attr("cy", 50 + qubitIndex * qubitSpacing)
        .attr("r", 10)
        .attr("fill", "green");

      currentX += 30;
    } else if (statement.type === NodeType.DisplayStatement) {
      const qubitIndex = qubitList.indexOf(statement.identifier);

      svg.append("text")
        .attr("x", currentX)
        .attr("y", 50 + qubitIndex * qubitSpacing)
        .attr("dy", "0.35em")
        .text("D")
        .attr("fill", "red");

      currentX += 30;
    }
  });
}

export default QuantumCircuit;
