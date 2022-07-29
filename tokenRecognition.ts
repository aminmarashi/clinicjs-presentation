import * as _ from 'lodash';
import { Token } from './types';

export function tokenize(unsanitizedSource: string): Token[] {
    const source = unsanitizedSource.replace(/[^\d\p{L}\p{S}\p{Z}\p{P}]+/ug, '');
    const tokensByPercentage = tokenizeByPercentage(source);
    if (tokensByPercentage.length) return tokensByPercentage;
    return guessTokens(source);
}

export function guessTokens(source: string): Token[] {
    // More info on unicode regex groups: https://unicode.org/reports/tr18/#General_Category_Property
    const tokens: Token[] = [];
    for (let i = 0; i < source.length;) {
        if (source[i].match(/^\d$/)) {
            const percentage = consumeWithRegex(source.slice(i), /^(\d+)([,.]\d+)?/);
            i = skipToken(i, percentage);
            if (tokens[tokens.length - 1]?.type === 'percentage') {
                // assume the last number was part of the previous word
                tokens[tokens.length - 1].value = percentage;
            } else {
                tokens.push({
                    type: 'percentage',
                    value: percentage.replace(',', '.')
                });
            }
        } else if (source[i].match(/^\p{L}$/u)) {
            let word = consumeWithRegex(source.slice(i), /^([\p{L}\p{S}\p{Z}\p{Pc}\p{Pd}\p{Po}]+)/u);
            // consume all words inclosed in brackets: (), etc.
            word += consumeWithRegex(source.slice(skipToken(i, word)), /^(\p{Ps}.+?\p{Pe})/u);
            i = skipToken(i, word);
            tokens.push({
                type: 'word',
                value: trimWord(word)
            });
        } else {
            // ignore everything non-alphanumeric
            const nonAlphanumeric = consumeWithRegex(source.slice(i), /^([^\d\p{L}]+)/u);
            i = skipToken(i, nonAlphanumeric);
        }
    }
    return tokens;
}

export function tokenizeByPercentage(source: string): Token[] {
    const separatedByPercentage = source.split(/(\d+[.,]?\d*\p{Z}*%)/u);
    if (separatedByPercentage.length < 2) {
        return [];
    }
    return separatedByPercentage.reduce((tokens, word) => {
        if (!word.match(/[^\p{Z}]/u)) return tokens;
        const percentage = word.match(/(\d+[.,]?\d*)\p{Z}*%/u);
        if (percentage) {
            return [...tokens, {
                type: 'percentage',
                value: percentage[1].replace(',', '.')
            }];
        } else {
            return [...tokens, {
                type: 'word',
                value: trimWord(word)
            }];
        }
    }, []);
}

export function validateToken({ type, value }) {
    if (type === 'percentage') {
        if (isNaN(value)) {
            throw Error('A percentage must be a number, instead got: ' + value);
        }
    } else if (type === 'material' || type === 'part') {
        if (!isNaN(value)) {
            throw Error(`A ${type} cannot be a number, got: ${value}`);
        }
    } else {
        throw Error(`An unknown token detected, type: ${type}, value: ${value}}`);
    }
    return { type, value };
}

export function trimWord(word: string): string {
    return _.trim(word.replace(/[\d\p{Z}\p{Pc}\p{Pd}\p{Po}]+$/u, '').replace(/^[\d\p{Z}\p{Pc}\p{Pd}\p{Po}]+/u, ''));
}

function consumeWithRegex(source, regex) {
    return source.match(regex)?.slice(1).join('') || '';
}

function skipToken(index, source) {
    return index + source.length;
}
