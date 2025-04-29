import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { ProgramNode, NodeType } from '@/input_handler/ast'
import './QuantumCircuit.css';

const QuantumCircuit: React.FC<{ program: ProgramNode }> = ({ program }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && program) {
      containerRef.current.innerHTML = '';

      const containerWidth = containerRef.current.clientWidth;
      const minLineWidth = containerWidth * 0.65;

      generateQuantumCircuit(program, containerRef.current, minLineWidth);
    }
  }, [program]);

  if (!program) {
    return <div className="no-circuit">No quantum circuit to display. Run a valid program first.</div>;
  }

  return (
      <div className="quantum-circuit-container">
        <div ref={containerRef} className="quantum-circuit"></div>
      </div>
  );
};

function generateQuantumCircuit(program: ProgramNode, container: HTMLElement, minLineWidth: number) {
  const qubitSpacing = 50;
  const padding = 50;
  const gateMinSize = 30;
  const gateTextPadding = 10;
  const gateSpacing = 50;

  const qubits = new Set<string>();

  program.statements.forEach(statement => {
    if (statement.type === NodeType.QubitDeclaration) {
      qubits.add(statement.identifier);
    } else if (statement.type === NodeType.LetStatement) {
      qubits.add(statement.identifier);
    }
  });

  program.statements.forEach(statement => {
    if (statement.type === NodeType.GateApplication) {
      statement.targets.forEach(target => {
        qubits.add(target.identifier);
      });
    } else if (statement.type === NodeType.MeasureStatement) {
      qubits.add(statement.target.identifier);
    }
  });

  const qubitList = Array.from(qubits);

  let totalWidth = padding * 2;
  let gateCount = 0;
  program.statements.forEach(statement => {
    if (statement.type === NodeType.GateApplication || statement.type === NodeType.MeasureStatement) {
      gateCount++;
    }
  });

  totalWidth += gateCount * (gateMinSize + gateSpacing);
  const svgWidth = Math.max(totalWidth, minLineWidth);
  const svgHeight = qubitList.length * qubitSpacing + padding * 2;

  const svg = d3.select(container)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .style("background", "#282a36");

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
      .attr("text-anchor", "end")
      .text(d => `${d}`)
      .attr("fill", "#f8f8f2")
      .attr("font-size", "14px");

  let currentX = padding;

  program.statements.forEach(statement => {
    if (statement.type === NodeType.GateApplication) {
      const targetIndices = statement.targets.map(target => qubitList.indexOf(target.identifier))
          .filter(index => index !== -1);

      if (targetIndices.length > 0) {
        targetIndices.sort((a, b) => a - b);

        const gate = svg.append("g");

        if (targetIndices.length === 1) {
          const qubitIndex = targetIndices[0];

          const tempText = svg.append("text")
              .attr("font-weight", "bold")
              .text(statement.gate)
              .attr("visibility", "hidden");

          const textWidth = tempText.node()?.getBBox().width || 0;
          tempText.remove();
          const gateWidth = Math.max(gateMinSize, textWidth + gateTextPadding * 2);

          gate.append("rect")
              .attr("x", currentX)
              .attr("y", padding + qubitIndex * qubitSpacing - gateMinSize / 2)
              .attr("width", gateWidth)
              .attr("height", gateMinSize)
              .attr("fill", "#50fa7b")
              .attr("rx", 4)
              .attr("ry", 4);

          gate.append("text")
              .attr("x", currentX + gateWidth / 2)
              .attr("y", padding + qubitIndex * qubitSpacing)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("fill", "#282a36")
              .attr("font-weight", "bold")
              .text(statement.gate);
        } else {
          const topQubitIndex = targetIndices[0];
          const bottomQubitIndex = targetIndices[targetIndices.length - 1];
          const height = (bottomQubitIndex - topQubitIndex) * qubitSpacing + gateMinSize;

          const tempText = svg.append("text")
              .attr("font-weight", "bold")
              .text(statement.gate)
              .attr("visibility", "hidden");

          const textWidth = tempText.node()?.getBBox().width || 0;
          tempText.remove();
          const gateWidth = Math.max(gateMinSize, textWidth + gateTextPadding * 2);

          gate.append("rect")
              .attr("x", currentX)
              .attr("y", padding + topQubitIndex * qubitSpacing - gateMinSize / 2)
              .attr("width", gateWidth)
              .attr("height", height)
              .attr("fill", "#ff79c6")
              .attr("rx", 4)
              .attr("ry", 4);

          gate.append("text")
              .attr("x", currentX + gateWidth / 2)
              .attr("y", padding + (topQubitIndex + bottomQubitIndex) * qubitSpacing / 2)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "central")
              .attr("fill", "#282a36")
              .attr("font-weight", "bold")
              .text(statement.gate);

          targetIndices.forEach(qubitIndex => {
            gate.append("line")
                .attr("x1", currentX - 5)
                .attr("x2", currentX + gateWidth + 5)
                .attr("y1", padding + qubitIndex * qubitSpacing)
                .attr("y2", padding + qubitIndex * qubitSpacing)
                .attr("stroke", "#f8f8f2")
                .attr("stroke-width", 2);
          });
        }
      }

      const tempText = svg.append("text")
          .attr("font-weight", "bold")
          .text(statement.gate)
          .attr("visibility", "hidden");

      const textWidth = tempText.node()?.getBBox().width || 0;
      tempText.remove();
      const gateWidth = Math.max(gateMinSize, textWidth + gateTextPadding * 2);

      currentX += gateWidth + gateSpacing;
    }
    else if (statement.type === NodeType.MeasureStatement) {
      const qubitIndex = qubitList.indexOf(statement.target.identifier);

      if (qubitIndex !== -1) {
        const measureSize = gateMinSize;

        svg.append("circle")
            .attr("cx", currentX + measureSize / 2)
            .attr("cy", padding + qubitIndex * qubitSpacing)
            .attr("r", measureSize / 2)
            .attr("fill", "#ffb86c");

        svg.append("text")
            .attr("x", currentX + measureSize / 2)
            .attr("y", padding + qubitIndex * qubitSpacing)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "#282a36")
            .attr("font-weight", "bold")
            .text("M");

        currentX += measureSize + gateSpacing;
      }
    }
  });
}

export default QuantumCircuit;