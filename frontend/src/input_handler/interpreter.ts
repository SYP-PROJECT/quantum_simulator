import * as math from 'mathjs';
import {
    Expression,
    GateApplication,
    IfStatement,
    InfixExpression,
    LetStatement,
    MeasureStatement,
    NodeType,
    PrefixExpression, PrintStatement,
    ProgramNode,
    RepeatStatement,
    StatementNode
} from "@/input_handler/ast";

type QuantumState = math.Matrix;
type QubitIndex = number;
type GateMatrix = math.Matrix;

interface QuantumGate {
    name: string;
    matrix: GateMatrix;
    isEntangling: boolean;
    numQubits: number;
}

const eye = (n: number) => math.identity(n) as math.Matrix;

class QuantumSystem {
    private state: QuantumState = null!;
    private qubitNames: Set<string> = new Set();
    private nameToIndex: Map<string, QubitIndex> = new Map();
    private gates: Map<string, QuantumGate> = new Map();
    private classicalBits: Map<string, 1 | 0> = new Map();
    private registerNames: Set<string> = new Set();
    private readonly interpreter: Interpreter | null = null;

    constructor(interpreter?: Interpreter) {
        this.interpreter = interpreter || null;
        this.initializeGates();
    }

    addQubit(name: string, initialState: '|0>' | '|1>' = '|0>'): void {
        if (this.interpreter && this.interpreter.hasClassicalVariable(name)) {
            throw new Error(`Variable name collision: '${name}' is already defined as a classical variable`);
        }

        if (this.qubitNames.has(name)) {
            throw new Error(`Redefinition error: Qubit '${name}' already exists`);
        }

        const newIndex = this.qubitNames.size;
        this.qubitNames.add(name);
        this.nameToIndex.set(name, newIndex);

        const newQubitState = initialState === '|0>' ?
            math.matrix([[1], [0]], 'sparse') :
            math.matrix([[0], [1]], 'sparse');

        this.state = this.state ?
            math.kron(this.state, newQubitState) as QuantumState :
            newQubitState;
    }

    addRegister(name: string, size: number): void {
        if (this.registerNames.has(name)) {
            throw new Error(`Redefinition error: Register '${name}' already exists`);
        }

        if (this.interpreter && this.interpreter.hasClassicalVariable(name)) {
            throw new Error(`Variable name collision: '${name}' is already defined as a classical variable`);
        }

        this.registerNames.add(name);
        for (let i = 0; i < size; i++) {
            const qubitName = `${name}_${i}`;
            if (this.qubitNames.has(qubitName)) {
                throw new Error(`Redefinition error: Qubit '${qubitName}' from register '${name}' already exists`);
            }
            this.addQubit(qubitName);
        }
    }

    applyGate(gateName: string, targetNames: string[]): void {
        const gate = this.gates.get(gateName.toUpperCase());
        if (!gate) {
            throw new Error(`Unknown gate: '${gateName}'`);
        }
        if (targetNames.length !== gate.numQubits) {
            throw new Error(`Incompatible operation: Gate '${gateName}' requires exactly ${gate.numQubits} target(s), got ${targetNames.length}`);
        }

        const targetIndices = targetNames.map(name => this.getQubitIndex(name));
        this.applyGateToIndices(gate, targetIndices);
    }

    measure(qubitName: string, bitName: string): 1 | 0 {
        const qubitIndex = this.getQubitIndex(qubitName);
        const result = this.measureQubit(qubitIndex);
        this.classicalBits.set(bitName, result);
        return result;
    }

    private applyGateToIndices(gate: QuantumGate, targetIndices: QubitIndex[]): void {
        if (targetIndices.length === 1) {
            this.applySingleQubitGate(gate, targetIndices[0]);
        } else {
            this.applyMultiQubitGate(gate, targetIndices);
        }
    }

    private applySingleQubitGate(gate: QuantumGate, targetIndex: QubitIndex): void {
        const numQubits = this.qubitNames.size;
        let operator = math.identity(1) as math.Matrix;

        for (let i = 0; i < numQubits; i++) {
            operator = math.kron(
                operator,
                i === targetIndex ? gate.matrix : eye(2)
            ) as math.Matrix;
        }

        this.state = math.multiply(operator, this.state) as QuantumState;
    }

    private applyMultiQubitGate(gate: QuantumGate, targetIndices: QubitIndex[]): void {
        const sortedIndices = [...targetIndices].sort((a, b) => a - b);

        const permutation = this.calculatePermutation(sortedIndices);

        const permutedState = this.permuteState(permutation);

        const fullOperator = math.kron(
            gate.matrix,
            eye(2 ** (this.qubitNames.size - gate.numQubits))
        ) as math.Matrix;

        const transformedState = math.multiply(fullOperator, permutedState) as QuantumState;

        const inversePermutation = permutation.map((_, i) => permutation.indexOf(i));

        this.state = this.permuteState(inversePermutation, transformedState);
    }

    private measureQubit(qubitIndex: QubitIndex): 1 | 0 {
        if (!this.state || this.qubitNames.size === 0) {
            throw new Error("Quantum state not initialized");
        }

        const prob1 = this.getProbabilityByIndex(qubitIndex);
        const result = Math.random() < prob1;

        this.collapseState(qubitIndex, result);
        return result ? 1 : 0;
    }

    private getProbabilityByIndex(qubitIndex: number): number {
        const stateArray = this.state.toArray() as number[][];
        let prob1 = 0;

        for (let i = 0; i < stateArray.length; i++) {
            if ((i >> qubitIndex) & 1) {
                const amplitude = stateArray[i][0];
                prob1 += Math.pow(Math.abs(amplitude), 2);
            }
        }
        return prob1;
    }

    private collapseState(qubitIndex: QubitIndex, result: boolean): void {
        const stateSize = 2 ** this.qubitNames.size;
        const projector = math.zeros(stateSize, stateSize, 'sparse') as math.Matrix;

        for (let i = 0; i < stateSize; i++) {
            const bitValue = (i >> qubitIndex) & 1;
            if (bitValue === (result ? 1 : 0)) {
                projector.set([i, i], 1);
            }
        }

        const projectedState = math.multiply(projector, this.state) as QuantumState;

        const stateArray = projectedState.toArray() as number[][];
        let normSquared = 0;

        for (let i = 0; i < stateArray.length; i++) {
            const amplitude = stateArray[i][0];
            if (amplitude) {
                normSquared += Math.pow(Math.abs(amplitude), 2);
            }
        }

        const MIN_NORM = 1e-10;
        if (normSquared < MIN_NORM) {
            throw new Error(`Measurement outcome has zero probability (norm=${Math.sqrt(normSquared)})`);
        }

        const norm = Math.sqrt(normSquared);

        const normalizedState = math.zeros(stateArray.length, 1, 'sparse') as QuantumState;
        for (let i = 0; i < stateArray.length; i++) {
            const value = projectedState.get([i, 0]);
            if (value) {
                normalizedState.set([i, 0], value / norm);
            }
        }

        this.state = normalizedState;
    }

    private getQubitIndex(name: string): QubitIndex {
        const index = this.nameToIndex.get(name);
        if (index === undefined) {
            throw new Error(`Undefined qubit: '${name}' not found`);
        }
        return index;
    }

    private calculatePermutation(targetIndices: number[]): number[] {
        const allIndices = [...Array(this.qubitNames.size).keys()];
        const nonTargetIndices = allIndices.filter(i => !targetIndices.includes(i));
        return [...targetIndices, ...nonTargetIndices];
    }

    private permuteState(permutation: number[], state?: QuantumState): QuantumState {
        const inputState = state || this.state;
        const permutedState = math.zeros(inputState.size()[0], 1, 'sparse') as QuantumState;
        const stateArray = inputState.toArray() as math.Complex[][];
        const n = this.qubitNames.size;

        for (let i = 0; i < stateArray.length; i++) {
            let newIndex = 0;
            for (let p = 0; p < n; p++) {
                const bit = (i >> permutation[p]) & 1;
                newIndex |= (bit << p);
            }
            permutedState.set([newIndex, 0], stateArray[i][0]);
        }
        return permutedState;
    }

    private initializeGates(): void {
        this.addGate({
            name: 'H',
            matrix: math.matrix([[1 / Math.sqrt(2), 1 / Math.sqrt(2)], [1 / Math.sqrt(2), -1 / Math.sqrt(2)]]),
            isEntangling: false,
            numQubits: 1
        });
        this.addGate({
            name: 'X',
            matrix: math.matrix([[0, 1], [1, 0]]),
            isEntangling: false,
            numQubits: 1
        });
        this.addGate({
            name: 'Z',
            matrix: math.matrix([
                [1, 0],
                [0, -1]
            ]),
            isEntangling: false,
            numQubits: 1
        });
        this.addGate({
            name: 'Y',
            matrix: math.matrix([
                [0, math.complex(0, -1)],
                [math.complex(0, 1), 0]
            ]),
            isEntangling: false,
            numQubits: 1
        });
        this.addGate({
            name: 'S',
            matrix: math.matrix([
                [1, 0],
                [0, math.complex(0, 1)]
            ]),
            isEntangling: false,
            numQubits: 1
        });
        this.addGate({
            name: 'T',
            matrix: math.matrix([
                [1, 0],
                [0, math.complex(Math.cos(Math.PI/4), Math.sin(Math.PI/4))]
            ]),
            isEntangling: false,
            numQubits: 1
        });
        this.addGate({
            name: 'CNOT',
            matrix: math.matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 1], [0, 0, 1, 0]]),
            isEntangling: true,
            numQubits: 2
        });
        this.addGate({
            name: 'SWAP',
            matrix: math.matrix([[1, 0, 0, 0], [0, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 1]]),
            isEntangling: false,
            numQubits: 2
        });
        this.addGate({
            name: 'CZ',
            matrix: math.matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, -1]]),
            isEntangling: true,
            numQubits: 2
        });
    }

    private addGate(gate: QuantumGate): void {
        this.gates.set(gate.name, gate);
    }

    getStateVector(): math.Matrix {
        return this.state;
    }
}

export class Interpreter {
    private quantumSystem: QuantumSystem = null!;
    private classicalState: Map<string,  boolean | math.Complex> = null!;
    private output: string[] = [];

    interpret(program: ProgramNode): string {
        try {
            this.quantumSystem = new QuantumSystem(this);
            this.classicalState = new Map();
            this.output = [];
            for (const statement of program.statements) {
                this.executeStatement(statement);
            }
            return this.output.join('\n');
        } catch (error) {
            return `Interpreter error: ${(error as Error).message}`;
        }
    }

    public hasClassicalVariable(name: string): boolean {
        return this.classicalState && this.classicalState.has(name);
    }

    private executeStatement(statement: StatementNode): void {
        switch (statement.type) {
            case NodeType.QubitDeclaration:
                this.quantumSystem.addQubit(statement.identifier, statement.state);
                break;
            case NodeType.RegisterDeclaration:
                this.quantumSystem.addRegister(statement.identifier, statement.size);
                break;
            case NodeType.GateApplication:
                this.handleGateApplication(statement);
                break;
            case NodeType.MeasureStatement:
                this.handleMeasureStatement(statement);
                break;
            case NodeType.LetStatement:
                this.handleLetStatement(statement);
                break;
            case NodeType.RepeatStatement:
                this.handleRepeatStatement(statement);
                break;
            case NodeType.IfStatement:
                this.handleIfStatement(statement);
                break;
            case NodeType.PrintStatement:
                this.handlePrintStatement(statement);
                break;
        }
    }

    private handlePrintStatement(node: PrintStatement): void {
        const value = this.evaluateExpression(node.value);
        if (typeof value === "boolean") {
            this.output.push(value.toString());
        } else {
            if (math.isComplex(value)) {
                const real = value.re;
                const imag = value.im;
                this.output.push(imag != 0 ? `${real}${imag < 0 ? "" : "+"}${imag}i` : `${real}`);
            }
        }
    }

    private handleGateApplication(node: GateApplication): void {
        if (node.targets.length === 0) {
            throw new Error(`Gate application '${node.gate}' requires at least one target`);
        }

        const targets = node.targets.map(target => {
            if (target.index === null && this.quantumSystem['registerNames'].has(target.identifier)) {
                throw new Error(`Invalid target '${target.identifier}' in gate '${node.gate}': Use indexed register (e.g., reg[0]) or single qubit`);
            }
            if (target.index !== null && !this.quantumSystem['registerNames'].has(target.identifier)) {
                throw new Error(`Undefined register '${target.identifier}' in gate '${node.gate}'`);
            }
            const qubitName = target.index !== null ? `${target.identifier}_${target.index}` : target.identifier;
            if (!this.quantumSystem['qubitNames'].has(qubitName)) {
                throw new Error(`Undefined qubit '${qubitName}' in gate '${node.gate}'`);
            }
            return qubitName;
        });

        this.quantumSystem.applyGate(node.gate, targets);
    }

    private handleMeasureStatement(node: MeasureStatement): void {
        const target = node.target;
        if (target.index === null && this.quantumSystem['registerNames'].has(target.identifier)) {
            throw new Error(`Invalid measurement target '${target.identifier}': Use indexed register (e.g., reg[0]) or single qubit`);
        }
        if (target.index !== null && !this.quantumSystem['registerNames'].has(target.identifier)) {
            throw new Error(`Undefined register '${target.identifier}' in measurement`);
        }
        const qubitName = target.index !== null ? `${target.identifier}_${target.index}` : target.identifier;
        if (!this.quantumSystem['qubitNames'].has(qubitName)) {
            throw new Error(`Undefined qubit '${qubitName}' in measurement`);
        }

        if (this.quantumSystem['qubitNames'].has(node.result) ||
            this.quantumSystem['registerNames'].has(node.result)) {
            throw new Error(`Name collision: Measurement result '${node.result}' conflicts with a quantum variable`);
        }

        const result = this.quantumSystem.measure(qubitName, node.result);
        this.classicalState.set(node.result, result == 1 ? math.complex(1, 0) : math.complex(0, 0));
    }

    private handleLetStatement(node: LetStatement): void {
        if (this.quantumSystem['qubitNames'].has(node.identifier) ||
            this.quantumSystem['registerNames'].has(node.identifier)) {
            throw new Error(`Variable name collision: '${node.identifier}' is already defined as a quantum variable`);
        }

        if (this.classicalState.has(node.identifier)) {
            throw new Error(`Redefinition error: Classical variable '${node.identifier}' already defined`);
        }

        const value = this.evaluateExpression(node.value);
        this.classicalState.set(node.identifier, value);
    }

    private handleRepeatStatement(node: RepeatStatement): void {
        for (let i = 0; i < node.count; i++) {
            for (const stmt of node.statements) {
                this.executeStatement(stmt);
            }
        }
    }

    private handleIfStatement(node: IfStatement): void {
        const condition = this.evaluateExpression(node.condition);
        if (typeof condition === "boolean" && condition) {
            for (const stmt of node.statements) {
                this.executeStatement(stmt);
            }
        } else if (typeof condition !== "boolean") {
            throw new Error(`Type error: Condition in if statement must be a boolean`);
        }
    }

    private evaluateExpression(expr: Expression): boolean | math.Complex {
        switch (expr.type) {
            case NodeType.BooleanLiteral:
                return expr.value as boolean;
            case NodeType.RealLiteral:
                return math.complex(expr.value, 0);
            case NodeType.ImaginaryLiteral:
                return math.complex(0, expr.value as number);
            case NodeType.Identifier:
                const value = this.classicalState.get(expr.value as string);
                if (value === undefined) {
                    throw new Error(`Undefined variable: '${expr.value}' not found'`);
                }
                return value;
            case NodeType.PrefixExpression:
                return this.evaluatePrefixExpression(expr);
            case NodeType.InfixExpression:
                return this.evaluateInfixExpression(expr);
        }
    }

    private evaluateInfixExpression(expr: InfixExpression): boolean | math.Complex {
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);

        if (typeof left === 'boolean' || typeof right === 'boolean') {
            if (expr.operator === '&&' || expr.operator === '||' || expr.operator === '==' || expr.operator === '!=') {
                if (typeof left !== 'boolean' || typeof right !== 'boolean') {
                    throw new Error(`Type error: Cannot apply '${expr.operator}' between boolean and complex number`);
                }

                switch (expr.operator) {
                    case '&&': return left && right;
                    case '||': return left || right;
                    case '==': return left === right;
                    case '!=': return left !== right;
                }
            }
            throw new Error(`Type error: Cannot apply '${expr.operator}' to boolean value`);
        }

        switch (expr.operator) {
            case '+': return math.add(left, right) as math.Complex;
            case '-': return math.subtract(left, right) as math.Complex;
            case '*': return math.multiply(left, right) as math.Complex;
            case '/': return math.divide(left, right) as math.Complex;
            case '==': return math.equal(left, right) as boolean;
            case '!=': return !math.equal(left, right);
            case '<':
                return Interpreter.complexMagnitude(left) < Interpreter.complexMagnitude(right);
            case '<=':
                return Interpreter.complexMagnitude(left) <= Interpreter.complexMagnitude(right);
            case '>':
                return Interpreter.complexMagnitude(left) > Interpreter.complexMagnitude(right);
            case '>=':
               return Interpreter.complexMagnitude(left) >= Interpreter.complexMagnitude(right);
            default:
                throw new Error(`Unsupported operator: ${expr.operator}`);
        }
    }

    private static complexMagnitude(z: math.Complex): number {
        return Math.sqrt(z.re * z.re + z.im * z.im);
    }

    private evaluatePrefixExpression(expr: PrefixExpression): boolean | math.Complex {
        const right = this.evaluateExpression(expr.right);
        switch (expr.operator) {
            case '!':
                if(typeof right !== 'boolean') {
                    throw new Error(`Type error: Cannot apply '!' to complex number`);
                }
                return !right as boolean;
            case '-':
                if (typeof right === 'boolean') {
                    throw new Error(`Type error: Cannot apply '-' to boolean value`);
                }
                return math.multiply(right, -1) as math.Complex;
            default:
                throw new Error(`Unsupported operator: ${expr.operator}`);
        }
    }
}