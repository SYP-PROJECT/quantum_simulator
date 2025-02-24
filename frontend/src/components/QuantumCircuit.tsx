import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ProgramNode, NodeType } from '../input_handler/ast'
import './QuantumCircuit.css';

const QuantumCircuit: React.FC<{ program: ProgramNode }> = ({ program }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';

      const containerWidth = containerRef.current.clientWidth;
      const minLineWidth = containerWidth * 0.65;

      generateQuantumCircuit(program, containerRef.current, minLineWidth);
    }
  }, [program]);

  return (
    <div className="quantum-circuit-container">
      <div ref={containerRef} className="quantum-circuit"></div>
    </div>
  );
};

function generateQuantumCircuit(program: ProgramNode, container: HTMLElement, minLineWidth: number) {
  const qubitSpacing = 50;
  const padding = 50;
  const gateSize = 30;
  const gateSpacing = 50;

  let totalWidth = padding * 2;
  program.statements.forEach(statement => {
    if (statement.type === NodeType.ApplyStatement || statement.type === NodeType.MeasureStatement || statement.type === NodeType.DisplayStatement) {
      totalWidth += gateSize + gateSpacing;
    }
  });

  const svgWidth = Math.max(totalWidth, minLineWidth);
  const svgHeight = program.statements.length * qubitSpacing + padding * 2;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .style("background", "#282a36");

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
    .attr("x1", padding)
    .attr("x2", svgWidth - padding)
    .attr("y1", (_, i) => padding + i * qubitSpacing)
    .attr("y2", (_, i) => padding + i * qubitSpacing)
    .attr("stroke", "#bd93f9")
    .attr("stroke-width", 2);

  svg.selectAll(".qubit-label")
    .data(qubitList)
    .enter()
    .append("text")
    .attr("x", padding - 20)
    .attr("y", (_, i) => padding + i * qubitSpacing)
    .attr("dy", "0.35em")
    .text(d => `${d}`)
    .attr("fill", "#f8f8f2");

  let currentX = padding;
  program.statements.forEach(statement => {
    if (statement.type === NodeType.ApplyStatement) {
      const qubitIndex = qubitList.indexOf(statement.identifier1);
      const gate = svg.append("g");

      gate.append("rect")
        .attr("x", currentX)
        .attr("y", padding + qubitIndex * qubitSpacing - gateSize / 2)
        .attr("width", gateSize)
        .attr("height", gateSize)
        .attr("fill", "#50fa7b");

      currentX += gateSize + gateSpacing;
    }
    else if (statement.type === NodeType.MeasureStatement) {
      const qubitIndex = qubitList.indexOf(statement.identifier);

      svg.append("circle")
        .attr("cx", currentX + gateSize / 2)
        .attr("cy", padding + qubitIndex * qubitSpacing)
        .attr("r", 10)
        .attr("fill", "#ffb86c");

      currentX += gateSize + gateSpacing;
    }
    else if (statement.type === NodeType.DisplayStatement) {
      const qubitIndex = qubitList.indexOf(statement.identifier);

      svg.append("text")
        .attr("x", currentX + gateSize / 2)
        .attr("y", padding + qubitIndex * qubitSpacing)
        .attr("dy", "0.35em")
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("D")
        .attr("fill", "#ff5555");

      currentX += gateSize + gateSpacing;
    }
  });
}

export default QuantumCircuit;
