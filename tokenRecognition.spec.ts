import { guessTokens, tokenizeByPercentage } from './tokenRecognition';

const token = (type, value) => ({ type, value });

const percentage = {
    100: token('percentage', '100'),
    99: token('percentage', '99'),
    1: token('percentage', '1'),
    123: token('percentage', '123')
};

const word = {
    a: token('word', 'a'),
    b: token('word', 'b'),
    aSymbol: token('word', 'a®'),
    'a/b': token('word', 'a/b')
};

describe('tokenizeByPercentage', () => {
    it('should support format: [ number ] [ word ]', () => {
        expect(tokenizeByPercentage('100%a')).toEqual([percentage[100], word.a]);
    });
    it('should support format: [ number ] [ delimiter ] [ word ]', () => {
        expect(tokenizeByPercentage('100%,a')).toEqual([percentage[100], word.a]);
    });
    it('should support format: [ word ] [ percentage ]', () => {
        expect(tokenizeByPercentage('a100%')).toEqual([word.a, percentage[100]]);
    });
    it('should support format: [ word ] [ delimiter ] [ percentage ]', () => {
        expect(tokenizeByPercentage('a,100%')).toEqual([word.a, percentage[100]]);
    });
    it('should support format: [ word ] [ number ] [ percentage ]', () => {
        expect(tokenizeByPercentage('a 123 100%')).toEqual([word.a, percentage[100]]);
    });
    it('should support format: [ word with special characters] [ percentage ]', () => {
        expect(tokenizeByPercentage('a/b100%')).toEqual([word['a/b'], percentage[100]]);
    });
    it('should support format: [ composition ], [ composition ]', () => {
        expect(tokenizeByPercentage('99%a 1%b')).toEqual([
            percentage[99],
            word.a,
            percentage[1],
            word.b
        ]);
    });
    it('should support material with special characters', () => {
        expect(tokenizeByPercentage('100% a®')).toEqual([ percentage[100], word.aSymbol ]);
    });
    it('should support material with numbers', () => {
        expect(tokenizeByPercentage('100% a 123')).toEqual([ percentage[100], word.a ]);
    });
    it('should not support material without percentage', () => {
        expect(tokenizeByPercentage('100 a 123')).toEqual([]);
    });
});

describe('guessTokens', () => {
    it('should support format: [ number ] [ word ]', () => {
        expect(guessTokens('100a')).toEqual([ percentage[100], word.a ]);
    });
    it('should support format: [ number ] [ delimiter ] [ word ]', () => {
        expect(guessTokens('100,a')).toEqual([ percentage[100], word.a ]);
    });
    it('should support format: [ word ] [ number ]', () => {
        expect(guessTokens('100a')).toEqual([ percentage[100], word.a ]);
    });
    it('should support format: [ word ] [ number ]', () => {
        expect(guessTokens('a100')).toEqual([word.a, percentage[100]]);
    });
    it('should support format: [ word ] [ delimiter ] [ number ]', () => {
        expect(guessTokens('a,100')).toEqual([word.a, percentage[100]]);
    });
    it('should support format: [ word ] [ number ] [ percentage ]', () => {
        expect(guessTokens('a 123 100%')).toEqual([word.a, percentage[100]]);
    });
    it('should support format: [ word with special characters] [ percentage ]', () => {
        expect(guessTokens('a/b100')).toEqual([word['a/b'], percentage[100]]);
    });
    it('should support format: [ composition ], [ composition ]', () => {
        expect(guessTokens('99a 1b')).toEqual([
            percentage[99],
            word.a,
            percentage[1],
            word.b
        ]);
    });
    it('should support material with special characters', () => {
        expect(guessTokens('100 a®')).toEqual([ percentage[100], word.aSymbol ]);
    });
    it('should support material with numbers', () => {
        expect(guessTokens('100 a 123')).toEqual([ percentage[100], word.a, percentage[123] ]);
    });
});
