"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var GeneText_1 = require("./GeneText");
var MathUtils_1 = require("./MathUtils");
var trainingDataSet = {
    dataCount: 100,
    inputCount: 6,
    labelCount: 3,
    inputs: [],
    labels: [],
};
function train(network, trainingDataSet, activate, loopCount, learnRatio, onLoopCallback) {
    var layers = network.layers;
    var dataCount = trainingDataSet.dataCount, inputCount = trainingDataSet.inputCount, labelCount = trainingDataSet.labelCount, inputs = trainingDataSet.inputs, labels = trainingDataSet.labels;
    var _loop_1 = function (loopNumber) {
        var input = (0, MathUtils_1.matTranspose)((0, MathUtils_1.createMatrixFromArray)(inputCount, dataCount, inputs));
        var label = (0, MathUtils_1.matTranspose)((0, MathUtils_1.createMatrixFromArray)(labelCount, dataCount, labels));
        var buffersZ = [];
        var buffersA = [];
        // Z[n] = W * A[n-1] + C
        // if layerIndex === layers.length - 1 => A[n] = Z[n];
        // if layerIndex < layers.length - 1 => A[n] = activate(Z[n]);
        for (var layerIndex = 0; layerIndex < layers.length; layerIndex++) {
            var layer = layers[layerIndex];
            var prevA = layerIndex > 0 ? buffersA[layerIndex - 1] : input;
            var prevASize = (0, MathUtils_1.matHeight)(prevA);
            var w = (0, MathUtils_1.matSlice)(layer, 0, 0, prevASize, (0, MathUtils_1.matHeight)(layer));
            var b = (0, MathUtils_1.matSlice)(layer, prevASize, 0, 1, (0, MathUtils_1.matHeight)(layer));
            var z = (0, MathUtils_1.matAddExt)((0, MathUtils_1.matDot)(w, prevA), b);
            var a = (layerIndex === layers.length - 1) ? z : (0, MathUtils_1.matMap)(z, function (n) { return activate(n); });
            buffersZ.push(z);
            buffersA.push(a);
        }
        var actualLabel = (0, MathUtils_1.arrayPeek)(buffersA) || [];
        // E for Error
        var buffersE = (0, MathUtils_1.createArray)(layers.length, function () { return []; });
        buffersE[buffersE.length - 1] = (0, MathUtils_1.matMul)((0, MathUtils_1.matMul)(actualLabel, (0, MathUtils_1.matSub)(1, actualLabel)), (0, MathUtils_1.matSub)(label, actualLabel));
        var _loop_2 = function (layerIndex) {
            var nextLayer = layers[layerIndex + 1];
            var nextLayerE = buffersE[layerIndex + 1];
            var a = buffersA[layerIndex];
            var e = (0, MathUtils_1.matMap)((0, MathUtils_1.matMul)(a, (0, MathUtils_1.matSub)(1, a)), function (v, x, i) { return v + (0, MathUtils_1.arraySum)((0, MathUtils_1.createArray)((0, MathUtils_1.matHeight)(nextLayer), function (k) { return (0, MathUtils_1.matGet)(nextLayer, i, k) * (0, MathUtils_1.matGet)(nextLayerE, x, k); })); });
            buffersE[layerIndex] = e;
        };
        for (var layerIndex = layers.length - 2; layerIndex >= 0; layerIndex--) {
            _loop_2(layerIndex);
        }
        for (var layerIndex = layers.length - 2; layerIndex >= 0; layerIndex--) {
            var layer = layers[layerIndex];
            var e = buffersE[layerIndex];
            var prevA = layerIndex > 0 ? buffersA[layerIndex - 1] : input;
            var prevASize = (0, MathUtils_1.matHeight)(prevA);
            var w = (0, MathUtils_1.matSlice)(layer, 0, 0, prevASize, (0, MathUtils_1.matHeight)(layer));
            var b = (0, MathUtils_1.matSlice)(layer, prevASize, 0, 1, (0, MathUtils_1.matHeight)(layer));
            var nw = (0, MathUtils_1.matAdd)(w, (0, MathUtils_1.matMul)(learnRatio, (0, MathUtils_1.matDot)(e, (0, MathUtils_1.matTranspose)(prevA))));
            var nb = (0, MathUtils_1.matAdd)(b, (0, MathUtils_1.matMul)(learnRatio, e));
            var newLayer = (0, MathUtils_1.matConcatHorizontal)(nw, nb);
            layers[layerIndex] = newLayer;
        }
        var finalE = (0, MathUtils_1.arrayPeek)(buffersE);
        var totalLoss = 0;
        (0, MathUtils_1.matForEach)(finalE, function (v) { return totalLoss += v; });
        var loss = totalLoss / ((0, MathUtils_1.matWidth)(finalE) * (0, MathUtils_1.matHeight)(finalE));
        onLoopCallback ? onLoopCallback(loss, loopNumber, loopCount) : null;
    };
    for (var loopNumber = 0; loopNumber < loopCount; loopNumber++) {
        _loop_1(loopNumber);
    }
}
function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}
function relu(x) {
    return x >= 0 ? x : 0;
}
var PI = Math.PI;
var DEFAULT_INPUT_COUNT = 6;
var DEFAULT_LABEL_COUNT = 3;
function checkNaN(n) {
    if (typeof n === 'number' && isNaN(n))
        throw new Error('NaN!');
    if (Array.isArray(n)) {
        for (var i = 0; i < n.length; i++) {
            checkNaN(n[i]);
        }
    }
}
function genTrainingDataSet() {
    var dataCount = 0;
    var inputCount = DEFAULT_INPUT_COUNT;
    var labelCount = DEFAULT_LABEL_COUNT;
    var inputs = [];
    var labels = [];
    for (var i = 0; i < 10; i++, dataCount++) {
        var length_1 = (0, MathUtils_1.rand)(0, 100);
        var nextCount = (0, MathUtils_1.randInt)(0, 4);
        var input = [1, 1, (0, MathUtils_1.rand)(0, 500), length_1, nextCount, (0, MathUtils_1.rand)(0, nextCount)];
        var label = [2 / (0.2 * length_1 - 1), (0, MathUtils_1.randInt)(1, 3), (0, MathUtils_1.rand)(-0.1, 0.1) * PI + (randCheck(0.5) ? 0 : PI)];
        inputs.push.apply(inputs, input);
        labels.push.apply(labels, label);
    }
    for (var i = 0; i < 200; i++, dataCount++) {
        var length_2 = (0, MathUtils_1.rand)(0, 100);
        var nextCount = (0, MathUtils_1.randInt)(2, 100);
        var input = [(0, MathUtils_1.randInt)(0, 10000), 1, (0, MathUtils_1.rand)(0, 500), length_2, nextCount, (0, MathUtils_1.rand)(0, nextCount)];
        var label = [2 / (0.2 * length_2 - 1), 0, 0];
        inputs.push.apply(inputs, input);
        labels.push.apply(labels, label);
    }
    for (var i = 0; i < 100; i++, dataCount++) {
        var length_3 = (0, MathUtils_1.rand)(15, 20);
        var nextCount = (0, MathUtils_1.randInt)(0, 2);
        var input = [(0, MathUtils_1.randInt)(0, 10000), 1, (0, MathUtils_1.rand)(0, 500), length_3, nextCount, (0, MathUtils_1.rand)(0, nextCount)];
        var label = [2 / (0.2 * length_3 - 1), randCheck(0.8) ? 0 : (0, MathUtils_1.randInt)(1, 4), (0, MathUtils_1.rand)(-0.1, 0.1) * PI + PI / 2];
        inputs.push.apply(inputs, input);
        labels.push.apply(labels, label);
    }
    for (var i = 0; i < 100; i++, dataCount++) {
        var length_4 = (0, MathUtils_1.rand)(20, 100);
        var nextCount = (0, MathUtils_1.randInt)(0, 2);
        var input = [(0, MathUtils_1.randInt)(0, 10000), 1, (0, MathUtils_1.rand)(0, 500), length_4, nextCount, (0, MathUtils_1.rand)(0, nextCount)];
        var label = [2 / (0.2 * length_4 - 1), 0, 0];
        inputs.push.apply(inputs, input);
        labels.push.apply(labels, label);
    }
    for (var i = 0; i < 100; i++, dataCount++) {
        var length_5 = (0, MathUtils_1.rand)(0, 100);
        var input = [(0, MathUtils_1.randInt)(0, 10000), 2, (0, MathUtils_1.rand)(0, 500), length_5, 0, 0];
        var label = [Math.max(0, -0.15 * length_5 + 2), 0, 0];
        inputs.push.apply(inputs, input);
        labels.push.apply(labels, label);
    }
    for (var i = 0; i < 100; i++, dataCount++) {
        var length_6 = (0, MathUtils_1.rand)(0, 100);
        var input = [(0, MathUtils_1.randInt)(0, 10000), 3, (0, MathUtils_1.rand)(0, 500), length_6, 0, 0];
        var label = [Math.max(0, -0.25 * length_6 + 2), 0, 0];
        inputs.push.apply(inputs, input);
        labels.push.apply(labels, label);
    }
    return {
        dataCount: dataCount,
        inputCount: inputCount,
        labelCount: labelCount,
        inputs: inputs,
        labels: labels,
    };
}
function loadTrainingDataSet() {
    var str = fs.readFileSync('./training-data-set.json', { encoding: 'utf-8' });
    var dataSet = JSON.parse(str);
    return dataSet;
}
function saveNetwork(network) {
    var gene = __spreadArray(__spreadArray([network.layers.length], network.layers.map(function (l) { return l.length; }), true), network.layers.flat(3), true);
    var str = (0, GeneText_1.geneToText)(gene);
    fs.writeFileSync('./network.txt', str);
}
function createNetwork() {
    var layers = [];
    var gen = function () { return (0, MathUtils_1.rand)(-0.01, 0.01); };
    var nodeCountOfEachlayer = [DEFAULT_INPUT_COUNT + 1, DEFAULT_INPUT_COUNT + 2, DEFAULT_INPUT_COUNT, DEFAULT_LABEL_COUNT + 1, DEFAULT_LABEL_COUNT];
    // const nodeCountOfEachlayer = [DEFAULT_INPUT_COUNT + 1, DEFAULT_INPUT_COUNT + 2, DEFAULT_LABEL_COUNT];
    var prevNodeCount = DEFAULT_INPUT_COUNT;
    for (var _i = 0, nodeCountOfEachlayer_1 = nodeCountOfEachlayer; _i < nodeCountOfEachlayer_1.length; _i++) {
        var nodeCount = nodeCountOfEachlayer_1[_i];
        layers.push((0, MathUtils_1.createMatrix)(prevNodeCount + 1, nodeCount, gen));
        prevNodeCount = nodeCount;
    }
    return {
        layers: layers,
    };
}
function main() {
    var dataSet = loadTrainingDataSet();
    var network = createNetwork();
    // console.log('dataSet');
    // console.log(dataSet);
    // console.log('network');
    // console.log(network.layers);
    var logger = function (loss, loopNumber, loopCount) {
        var num = loopNumber + 1;
        if (num % 100 === 0 || num === loopCount) {
            console.log("@".concat(num, "/").concat(loopCount, ": ").concat(loss));
        }
    };
    train(network, dataSet, sigmoid, 1000, 0.01, logger);
    saveNetwork(network);
}
function genTrainingDataSetFile() {
    var dataSet = genTrainingDataSet();
    var str = JSON.stringify(dataSet);
    fs.writeFileSync('./training-data-set.json', str);
    console.log('done');
}
main();
// genTrainingDataSetFile();
function randCheck(possibility) {
    return Math.random() < possibility;
}
function averge(nums) {
    if (nums.length <= 0)
        return 0;
    return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
}
//# sourceMappingURL=index.js.map