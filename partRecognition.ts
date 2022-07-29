import * as _ from 'lodash';
import { Token } from './types';
import { tokenize, validateToken, trimWord } from './tokenRecognition';

export function recognizeParts(material: string): Token[] {
    if (!material.includes(':')) {
        return [];
    }
    const guessedParts = _.trim(material).split(/(\p{L}{4,}[\d\p{L}\p{Z}]+):/u);
    return guessedParts.reduce(((tokens, word, index) => {
        if (index < 1) return tokens; // extra things before the first match are ignored
        if (index % 2 === 1) return [
            ...tokens,
            {
                type: 'part',
                value: trimWord(word)
            }
        ];
        const materialTokens = tokenize(word).map(material => {
            if (material.type === 'word') return { ...material, type: 'material' };
            return material;
        });
        return [...tokens, ...materialTokens];
    }), []).map(validateToken);
}

export function guessParts(material: string): Token[] {
    const tokens = tokenize(material);
    const guessedTokens = [];
    for (let i = 0; i < tokens.length; i++) {
        const { type, value } = tokens[i];
        if (i === tokens.length - 1) {
            // There were extra things in there, we just silently ignore them
        } else if (type === 'percentage') {
            if (tokens[i + 1]?.type !== 'word') {
                throw Error('Expected a material after a percentage')
            }
            guessedTokens.push({ type: 'percentage', value });
            guessedTokens.push({ type: 'material', value: tokens[++i].value });
        } else if (tokens[i + 1]?.type === 'word') {
            // Two adjacent words -> part: material
            guessedTokens.push({ type: 'part', value });
            guessedTokens.push({ type: 'material', value: tokens[++i].value });
        } else {
            // If the rest of tokens end with a material, word is a part
            // part 100 cotton -> first word is a part
            // cotton 10 silk 90 -> first word is a material
            if (isEndingWithWord(tokens.slice(i + 1))) {
                guessedTokens.push({ type: 'part', value });
                guessedTokens.push({ type: 'percentage', value: tokens[++i].value });
                guessedTokens.push({ type: 'material', value: tokens[++i].value });
            } else {
                guessedTokens.push({ type: 'material', value });
                guessedTokens.push({ type: 'percentage', value: tokens[++i].value });
            }
        }
    }

    guessedTokens.forEach(validateToken);
    return guessedTokens;
}

function isEndingWithWord(tokens) {
    let lastTokenType = 'word';
    for (let i = 0; i < tokens.length; i++) {
        const { type: tokenType } = tokens[i];
        if (tokenType === lastTokenType) {
            if (tokenType !== 'word') {
                throw Error('Parsing error: two adjacent tokens of type number detected');
            }
            // Two adjacent words are always end of the composition
            // part 100 cotton anotherpart ...
            return true;
        };
        lastTokenType = tokenType;
    }
    return lastTokenType === 'word';
}
