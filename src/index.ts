
import * as fs from 'fs';
import { geneToText } from './GeneText';
import { arrayPeek, createMatrixFromArray, matMap, matAdd, matDot, matHeight, Matrix, matSlice, matWidth, createArray, matSub, matMul, matGet, arraySum, matTranspose, matConcatHorizontal, matCol, matForEach, createMatrix, rand, randInt, matAddExt } from './MathUtils';

interface TrainingDataSet {
    dataCount: number;
    inputCount: number;
    labelCount: number;
    inputs: number[];
    labels: number[];
}

interface NeuralNetwork {
    layers: Matrix[];
}

const trainingDataSet: TrainingDataSet = {
    dataCount: 100,
    inputCount: 6,
    labelCount: 3,
    inputs: [],
    labels: [],
};

function train(network: NeuralNetwork, trainingDataSet: TrainingDataSet, activate: (x: number) => number, loopCount: number, learnRatio: number, onLoopCallback?: (loss: number, loopNumber: number, loopCount: number) => void) {
    const { layers } = network;
    const { dataCount, inputCount, labelCount, inputs, labels } = trainingDataSet;

    for (let loopNumber = 0; loopNumber < loopCount; loopNumber++) {

        const input: Matrix = matTranspose(createMatrixFromArray(inputCount, dataCount, inputs));
        const label: Matrix = matTranspose(createMatrixFromArray(labelCount, dataCount, labels));

        const buffersZ: Matrix[] = [];
        const buffersA: Matrix[] = [];

        // Z[n] = W * A[n-1] + C
        // if layerIndex === layers.length - 1 => A[n] = Z[n];
        // if layerIndex < layers.length - 1 => A[n] = activate(Z[n]);
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            const layer: Matrix = layers[layerIndex];
            const prevA = layerIndex > 0 ? buffersA[layerIndex - 1] : input;
            const prevASize = matHeight(prevA);

            const w = matSlice(layer, 0, 0, prevASize, matHeight(layer));
            const b = matSlice(layer, prevASize, 0, 1, matHeight(layer));

            const z: Matrix = matAddExt(matDot(w, prevA), b);
            const a: Matrix = (layerIndex === layers.length - 1) ? z : matMap(z, (n) => activate(n));

            buffersZ.push(z);
            buffersA.push(a);
        }

        const actualLabel = arrayPeek(buffersA) || [];

        // E for Error
        const buffersE: Matrix[] = createArray(layers.length, () => []);
        buffersE[buffersE.length - 1] = matMul(matMul(actualLabel, matSub(1, actualLabel)), matSub(label, actualLabel));
        for (let layerIndex = layers.length - 2; layerIndex >= 0; layerIndex--) {
            const nextLayer = layers[layerIndex + 1];
            const nextLayerE = buffersE[layerIndex + 1];

            const a = buffersA[layerIndex];
            const e = matMap(matMul(a, matSub(1, a)), (v, x, i) => v + arraySum(createArray(matHeight(nextLayer), (k) => matGet(nextLayer, i, k) * matGet(nextLayerE, x, k))));

            buffersE[layerIndex] = e;
        }

        for (let layerIndex = layers.length - 2; layerIndex >= 0; layerIndex--) {
            const layer = layers[layerIndex];
            const e = buffersE[layerIndex];
            const prevA = layerIndex > 0 ? buffersA[layerIndex - 1] : input;
            const prevASize = matHeight(prevA);

            const w = matSlice(layer, 0, 0, prevASize, matHeight(layer));
            const b = matSlice(layer, prevASize, 0, 1, matHeight(layer));

            const nw = matAdd(w, matMul(learnRatio, matDot(e, matTranspose(prevA))));
            const nb = matAdd(b, matMul(learnRatio, e));

            const newLayer = matConcatHorizontal(nw, nb);
            layers[layerIndex] = newLayer;
        }

        const finalE = arrayPeek(buffersE);
        let totalLoss = 0;
        matForEach(finalE, (v) => totalLoss += v);

        const loss = totalLoss / (matWidth(finalE) * matHeight(finalE));
        onLoopCallback ? onLoopCallback(loss, loopNumber, loopCount) : null;
    }
}

function sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
}

function relu(x: number): number {
    return x >= 0 ? x : 0;
}

const PI = Math.PI;
const DEFAULT_INPUT_COUNT = 6;
const DEFAULT_LABEL_COUNT = 3;

function checkNaN(n: any) {
    if (typeof n === 'number' && isNaN(n)) throw new Error('NaN!');
    if (Array.isArray(n)) {
        for (let i = 0; i < n.length; i++) {
            checkNaN(n[i]);
        }
    }
}

function genTrainingDataSet(): TrainingDataSet {
    let dataCount = 0;
    let inputCount = DEFAULT_INPUT_COUNT;
    let labelCount = DEFAULT_LABEL_COUNT;
    const inputs: number[] = [];
    const labels: number[] = [];

    for (let i = 0; i < 10; i++, dataCount++) {
        const length = rand(0, 100);
        const nextCount = randInt(0, 4);
        const input = [1, 1, rand(0, 500), length, nextCount, rand(0, nextCount)];
        const label = [2 / (0.2 * length - 1), randInt(1, 3), rand(-0.1, 0.1) * PI + (randCheck(0.5) ? 0 : PI)];

        inputs.push(...input);
        labels.push(...label);
    }

    for (let i = 0; i < 200; i++, dataCount++) {
        const length = rand(0, 100);
        const nextCount = randInt(2, 100);
        const input = [randInt(0, 10000), 1, rand(0, 500), length, nextCount, rand(0, nextCount)];
        const label = [2 / (0.2 * length - 1), 0, 0];

        inputs.push(...input);
        labels.push(...label);
    }

    for (let i = 0; i < 100; i++, dataCount++) {
        const length = rand(15, 20);
        const nextCount = randInt(0, 2);
        const input = [randInt(0, 10000), 1, rand(0, 500), length, nextCount, rand(0, nextCount)];
        const label = [2 / (0.2 * length - 1), randCheck(0.8) ? 0 : randInt(1, 4), rand(-0.1, 0.1) * PI + PI / 2];

        inputs.push(...input);
        labels.push(...label);
    }

    for (let i = 0; i < 100; i++, dataCount++) {
        const length = rand(20, 100);
        const nextCount = randInt(0, 2);
        const input = [randInt(0, 10000), 1, rand(0, 500), length, nextCount, rand(0, nextCount)];
        const label = [2 / (0.2 * length - 1), 0, 0];

        inputs.push(...input);
        labels.push(...label);
    }

    for (let i = 0; i < 100; i++, dataCount++) {
        const length = rand(0, 100);
        const input = [randInt(0, 10000), 2, rand(0, 500), length, 0, 0];
        const label = [Math.max(0, -0.15 * length + 2), 0, 0];

        inputs.push(...input);
        labels.push(...label);
    }

    for (let i = 0; i < 100; i++, dataCount++) {
        const length = rand(0, 100);
        const input = [randInt(0, 10000), 3, rand(0, 500), length, 0, 0];
        const label = [Math.max(0, -0.25 * length + 2), 0, 0];

        inputs.push(...input);
        labels.push(...label);
    }

    return {
        dataCount,
        inputCount,
        labelCount,
        inputs,
        labels,
    };
}

function loadTrainingDataSet(): TrainingDataSet {
    const str = fs.readFileSync('./training-data-set.json', { encoding: 'utf-8' });
    const dataSet = JSON.parse(str);
    return dataSet;
}

function saveNetwork(network: NeuralNetwork) {
    const gene: number[] = [network.layers.length, ...network.layers.map(l => l.length), ...network.layers.flat(3)];
    const str = geneToText(gene);
    fs.writeFileSync('./network.txt', str);
}

function createNetwork(): NeuralNetwork {
    const layers: Matrix[] = [];
    const gen = () => rand(-0.01, 0.01);

    const nodeCountOfEachlayer = [DEFAULT_INPUT_COUNT + 1, DEFAULT_INPUT_COUNT + 2, DEFAULT_INPUT_COUNT, DEFAULT_LABEL_COUNT + 1, DEFAULT_LABEL_COUNT];
    // const nodeCountOfEachlayer = [DEFAULT_INPUT_COUNT + 1, DEFAULT_INPUT_COUNT + 2, DEFAULT_LABEL_COUNT];
    let prevNodeCount = DEFAULT_INPUT_COUNT;
    for (const nodeCount of nodeCountOfEachlayer) {
        layers.push(createMatrix(prevNodeCount + 1, nodeCount, gen));
        prevNodeCount = nodeCount;
    }

    return {
        layers,
    }
}

function main() {
    const dataSet = loadTrainingDataSet();
    const network = createNetwork();

    // console.log('dataSet');
    // console.log(dataSet);
    // console.log('network');
    // console.log(network.layers);

    const logger = (loss: number, loopNumber: number, loopCount: number) => {
        const num = loopNumber + 1;
        if (num % 100 === 0 || num === loopCount) {
            console.log(`@${num}/${loopCount}: ${loss}`);
        }
    };
    train(network, dataSet, sigmoid, 1000, 0.01, logger);
    saveNetwork(network);
}

function genTrainingDataSetFile() {
    const dataSet = genTrainingDataSet();
    const str = JSON.stringify(dataSet);
    fs.writeFileSync('./training-data-set.json', str);
    console.log('done');
}

main();
// genTrainingDataSetFile();

function randCheck(possibility: number): boolean {
    return Math.random() < possibility;
}

function averge(nums: number[]): number {
    if (nums.length <= 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}