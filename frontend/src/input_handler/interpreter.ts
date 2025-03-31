import * as math from 'mathjs';
import {
    Expression,
    GateApplication,
    IfStatement, InfixExpression,
    LetStatement,
    MeasureStatement,
    NodeType, PrefixExpression,
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
    private classicalBits: Map<string, boolean> = new Map();
    private registerNames: Set<string> = new Set();

    constructor() {
        this.initializeGates();
    }

    addQubit(name: string, initialState: '|0>' | '|1>' = '|0>'): void {
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

    measure(qubitName: string, bitName: string): boolean {
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
        let operator = eye(1) as math.Matrix;
        for (let i = 0; i < this.qubitNames.size; i++) {
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
        const gateOperator = math.kron(
            gate.matrix,
            eye(2 ** (this.qubitNames.size - targetIndices.length))
        ) as math.Matrix;
        const transformedState = math.multiply(gateOperator, permutedState) as QuantumState;

        const inversePermutation = permutation.map((_, i) => permutation.indexOf(i));
        this.state = this.permuteState(inversePermutation, transformedState);
    }

    private measureQubit(qubitIndex: QubitIndex): boolean {
        const stateArray = this.state.toArray() as math.Complex[][];
        let prob1 = 0;

        for (let i = 0; i < stateArray.length; i++) {
            if ((i >> qubitIndex) & 1) {
                const amplitude = stateArray[i][0];
                prob1 += math.abs(math.multiply(amplitude, math.conj(amplitude))) as number;
            }
        }

        const result = Math.random() < prob1;
        this.collapseState(qubitIndex, result);
        return result;
    }

    private collapseState(qubitIndex: QubitIndex, result: boolean): void {
        const stateArray = this.state.toArray() as math.Complex[][];
        const newState = math.zeros(stateArray.length, 1, 'sparse') as QuantumState;

        for (let i = 0; i < stateArray.length; i++) {
            const qubitValue = (i >> qubitIndex) & 1;
            if (qubitValue === (result ? 1 : 0)) {
                newState.set([i, 0], stateArray[i][0]);
            }
        }

        const norm = math.norm(newState) as number;
        if (norm === 0) {
            throw new Error("Normalization failed: zero norm after collapse");
        }
        this.state = math.divide(newState, norm) as QuantumState;
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
    }

    private addGate(gate: QuantumGate): void {
        this.gates.set(gate.name, gate);
    }

    getStateVector(): math.Matrix {
        return this.state;
    }

    getProbability(qubitName: string): number {
        const index = this.getQubitIndex(qubitName);
        let prob1 = 0;
        const stateArray = this.state.toArray() as math.Complex[][];

        for (let i = 0; i < stateArray.length; i++) {
            if ((i >> index) & 1) {
                const amplitude = stateArray[i][0];
                prob1 += math.abs(math.multiply(amplitude, math.conj(amplitude))) as number;
            }
        }
        return prob1;
    }
}

export class Interpreter {
    private quantumSystem: QuantumSystem = null!;
    private classicalState: Map<string, boolean | [number, number]> = null!;
    private output: string[] = [];

    interpret(program: ProgramNode): string {
        try {
            this.quantumSystem = new QuantumSystem();
            this.classicalState = new Map();
            for (const statement of program.statements) {
                this.executeStatement(statement);
            }
            return this.output.join('\n');
        } catch (error) {
            return `Interpreter error: ${(error as Error).message}`;
        }
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

        const result = this.quantumSystem.measure(qubitName, node.result);
        this.classicalState.set(node.result, result);
    }

    private handleLetStatement(node: LetStatement): void {
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
        if (condition) {
            for (const stmt of node.statements) {
                this.executeStatement(stmt);
            }
        }
    }

    private evaluateExpression(expr: Expression): boolean | [number, number] {
        switch (expr.type) {
            case NodeType.BooleanLiteral:
                return expr.value as boolean;
            case NodeType.RealLiteral:
                return [expr.value, 0];
            case NodeType.ImaginaryLiteral:
                return [0, expr.value as number];
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

    private evaluateInfixExpression(expr: InfixExpression): boolean | [number, number] {
        const left = this.evaluateExpression(expr.left);
        const right = this.evaluateExpression(expr.right);
        switch (expr.operator) {
            case '&&':
                if (typeof left !== 'boolean' || typeof right !== 'boolean') {
                    throw new Error(`Unsupported operation: '&&' cannot be applied to non-boolean values`);
                }
                return left && right;
            case '||':
                if (typeof left !== 'boolean' || typeof right !== 'boolean') {
                    throw new Error(`Unsupported operation: '&&' cannot be applied to non-boolean values`);
                }
                return left || right;
            case '==':
                if (typeof left !== typeof right){
                    throw new Error(`Unsupported operation: '&&' cannot be applied to ${typeof left === 'boolean' ? 'boolean' : 'complex number'} and ${typeof left === 'boolean' ? 'boolean' : 'complex number'}`);
                }
                // @ts-expect-error Necessary because of the check above
                return typeof left === "boolean" ? left === right : left[0] === right[0] && left[1] === right[1];
            case '!=':
                if (typeof left !== typeof right){
                    throw new Error(`Unsupported operation: '||' cannot be applied to ${typeof left === 'boolean' ? 'boolean' : 'complex number'} and ${typeof left === 'boolean' ? 'boolean' : 'complex number'}`);
                }
                // @ts-expect-error Necessary because of the check above
                return typeof left !== "boolean" ? left === right : left[0] !== right[0] && left[1] !== right[1];
            case '<':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '<' cannot be applied to boolean value`);
                }
                return left[0] * left[0] + left[1] * left[1] < right[0] * right[0] + right[1] * right[1];
            case '<=':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '<=' cannot be applied to boolean value`);
                }
                return left[0] * left[0] + left[1] * left[1] <= right[0] * right[0] + right[1] * right[1];
            case '>':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '>' cannot be applied to boolean value`);
                }
                return left[0] * left[0] + left[1] * left[1] >= right[0] * right[0] + right[1] * right[1];
            case '>=':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '>=' cannot be applied to boolean value`);
                }
                return left[0] * left[0] + left[1] * left[1] >= right[0] * right[0] + right[1] * right[1];
            case '+':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '+' cannot be applied to boolean value`);
                }
                return [left[0] + right[0], left[1] + right[1]];
            case '-':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '-' cannot be applied to boolean value`);
                }
                return [left[0] - right[0], left[1] - right[1]];
            case '*':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '*' cannot be applied to boolean value`);
                }
                return [
                    left[0] * right[0] - left[1] * right[1],
                    left[0] * right[1] + left[1] * right[0]
                ];
            case '/':
                if (typeof left === 'boolean' || typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '/' cannot be applied to boolean value`);
                }
                const denominator = right[0] ** 2 + right[1] ** 2;
                return [
                    (left[0] * right[0] + left[1] * right[1]) / denominator,
                    (left[1] * right[0] - left[0] * right[1]) / denominator
                ];
            default:
                throw new Error(`Unsupported operator: ${expr.operator}`);
        }
    }

    private evaluatePrefixExpression(expr: PrefixExpression): boolean | [number, number] {
        const right = this.evaluateExpression(expr.right);
        switch (expr.operator) {
            case '!':
                if(typeof right !== 'boolean') {
                    throw new Error(`Unsupported operation: '!' cannot be applied to non-boolean value`);
                }
                return !right as boolean;
            case '-':
                if (typeof right === 'boolean') {
                    throw new Error(`Unsupported operation: '-' cannot be applied to boolean value`);
                }
                return [-right[0], -right[1]];
            default:
                throw new Error(`Unsupported operator: ${expr.operator}`);
        }

    }
}
