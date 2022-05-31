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
exports.textToGene = exports.geneToText = void 0;
var texts_1 = require("./texts");
function geneToText(gene) {
    var geneIndex = 0;
    var layerCount = gene[geneIndex++];
    var nodeCountsOfEachLayer = gene.slice(geneIndex, geneIndex + layerCount);
    geneIndex += layerCount;
    var lines = [];
    lines.push(__spreadArray([layerCount], nodeCountsOfEachLayer, true).map(function (n) { return (0, texts_1.intToString)(n, 3); }).join(" "));
    var inputLayerNodeCount = 6;
    var prevNodeCount = inputLayerNodeCount;
    for (var layerIndex = 0; layerIndex < layerCount; layerIndex++) {
        lines.push("#" + layerIndex);
        var nodeCount = nodeCountsOfEachLayer[layerIndex];
        for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
            lines.push(gene
                .slice(geneIndex, geneIndex + prevNodeCount + 1)
                .map(function (n) { return (0, texts_1.floatToString)(n, 3, 6); })
                .join(" "));
            geneIndex += prevNodeCount;
        }
        prevNodeCount = nodeCount;
    }
    return lines.join("\n");
}
exports.geneToText = geneToText;
function textToGene(text) {
    var lines = text
        .split("\n")
        .filter(function (l) { return !l.match(/^(#.*|\s*)$/); })
        .map(function (l) { return l.trim(); });
    var firstLineNumbers = lines[0].split(/\s+/g).map(function (str) { return (0, texts_1.stringToFloat)(str); });
    var layerCount = firstLineNumbers[0];
    var nodeCountsOfEachLayer = firstLineNumbers.slice(1);
    if (nodeCountsOfEachLayer.length != layerCount)
        throw new Error("nodeCountsOfEachLayer.length (".concat(nodeCountsOfEachLayer.length, ") should matches layerCount (").concat(layerCount, ")"));
    var gene = [];
    gene.push.apply(gene, __spreadArray([layerCount], nodeCountsOfEachLayer, false));
    var inputLayerNodeCount = 6;
    var lineIndex = 1;
    for (var layerIndex = 0; layerIndex < layerCount; layerIndex++) {
        var nodeCount = nodeCountsOfEachLayer[layerIndex];
        for (var nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
            gene.push.apply(gene, lines[lineIndex].split(/\s+/g).map(function (str) { return (0, texts_1.stringToFloat)(str); }));
            lineIndex++;
        }
    }
    return gene;
}
exports.textToGene = textToGene;
//# sourceMappingURL=GeneText.js.map