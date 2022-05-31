import { intToString, floatToString, stringToFloat } from "./texts";

export function geneToText(gene: number[]): string {
    let geneIndex = 0;

    const layerCount = gene[geneIndex++];
    const nodeCountsOfEachLayer = gene.slice(geneIndex, geneIndex + layerCount);
    geneIndex += layerCount;

    const lines: string[] = [];

    lines.push([layerCount, ...nodeCountsOfEachLayer].map((n) => intToString(n, 3)).join(" "));

    const inputLayerNodeCount = 6;
    let prevNodeCount = inputLayerNodeCount;
    for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
        lines.push("#" + layerIndex);

        const nodeCount = nodeCountsOfEachLayer[layerIndex];
        for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
            lines.push(
                gene
                    .slice(geneIndex, geneIndex + prevNodeCount + 1)
                    .map((n) => floatToString(n, 3, 6))
                    .join(" ")
            );
            geneIndex += prevNodeCount;
        }
        prevNodeCount = nodeCount;
    }

    return lines.join("\n");
}

export function textToGene(text: string): number[] {
    const lines = text
        .split("\n")
        .filter((l) => !l.match(/^(#.*|\s*)$/))
        .map((l) => l.trim());
    const firstLineNumbers = lines[0].split(/\s+/g).map((str) => stringToFloat(str));
    const layerCount = firstLineNumbers[0];
    const nodeCountsOfEachLayer = firstLineNumbers.slice(1);

    if (nodeCountsOfEachLayer.length != layerCount)
        throw new Error(`nodeCountsOfEachLayer.length (${nodeCountsOfEachLayer.length}) should matches layerCount (${layerCount})`);

    const gene: number[] = [];

    gene.push(layerCount, ...nodeCountsOfEachLayer);

    const inputLayerNodeCount = 6;
    let lineIndex = 1;
    for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
        const nodeCount = nodeCountsOfEachLayer[layerIndex];
        for (let nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
            gene.push(...lines[lineIndex].split(/\s+/g).map((str) => stringToFloat(str)));
            lineIndex++;
        }
    }

    return gene;
}