import * as _ from 'lodash';
import { PartGenerator } from './PartGenerator';
import { recognizeParts, guessParts } from './partRecognition';
import { Part } from './types';

const partGenerator = new PartGenerator();

export function transform(material: string): Part[] {
    if (!material) return [];
    try {
        if (material.match(/;|\n/)) {
            const guessedParts = material.split(/;|\n/);
            return _.flatMap(guessedParts, part => transform(part));
        }
    } catch {
        // not possible to determine parts by delimiters, let's hope we find them some other way
    }
    try {
        const recognizedParts = recognizeParts(material);
        if (recognizedParts.length) return partGenerator.generateParts(recognizedParts);
    } catch {
        // Oops, we don't recognize the parts format, let's try to guess what it is instead
    }
    try {
        return partGenerator.generateParts(guessParts(material));
    } catch (error) {
        error.message = `${error.message}, input: "${material}"`;
        throw error;
    }
}
