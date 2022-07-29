import { transform } from './materialTransformer';

const part = (partName, composition) => ({ partName, composition });
const composition = (material, percentage) => ({ material, percentage: percentage.toString() });
const matchesTransform = (material, expected) => expect(transform(material)).toEqual(expected);

describe('material transformer', () => {
    describe('compositions without part', () => {
        it('should support format: [ number ] [ word ]', () => {
            matchesTransform('100a', [part('', [composition('a', 100)])])
        });
        it('should support format: [ number ] [ delimiter ] [ word ]', () => {
            matchesTransform('100,a', [part('', [composition('a', 100)])])
        });
        it('should support format: [ word ] [ number ]', () => {
            matchesTransform('a100', [part('', [composition('a', 100)])])
        });
        it('should support format: [ word ] [ percentage ]', () => {
            matchesTransform('a100%', [part('', [composition('a', 100)])])
        });
        it('should support format: [ word ] [ delimiter ] [ number ]', () => {
            matchesTransform('a,100', [part('', [composition('a', 100)])])
        });
        it('should support format: [ word ] [ number ] [ percentage ]', () => {
            matchesTransform('a 123 100%', [part('', [composition('a', 100)])])
        });
        it('should support format: [ word with special characters] [ percentage ]', () => {
            matchesTransform('a/b100%', [part('', [composition('a/b', 100)])])
        });
        it('should support format: [ composition ], [ composition ]', () => {
            matchesTransform('99a, 1b', [part('', [composition('a', 99), composition('b', 1)])])
        });
        it('should support material with special characters', () => {
            matchesTransform('100% a®', [part('', [composition('a®', 100)])])
        });
        it('should support material with numbers', () => {
            matchesTransform('100% a 2', [part('', [composition('a', 100)])])
        });
        it('should ignore extra numbers at the end', () => {
            matchesTransform('100 a 123', [part('', [composition('a', 100)])]);
        });
        it('should support material with weird characters in the name', () => {
            matchesTransform('100% a\u0099b', [part('', [composition('ab', 100)])])
        });
    });

    describe('part detection by special characters', () => {
        it('should recognize parts separated by ;', () => {
            matchesTransform('100% a;100% b', [part('', [composition('a', 100)]), part('', [composition('b', 100)])])
        });
        it('should recognize parts indicated by :', () => {
            matchesTransform('p: 100a', [part('p', [composition('a', 100)])])
        });
        it('should recognize two parts indicated by :', () => {
            matchesTransform('part 1: 100a, part 2: 100a', [part('part', [composition('a', 100)]), part('part', [composition('a', 100)])])
        });
        it('should recognize parts and material with weird characters', () => {
            matchesTransform('part 1: 100% a 3b,4c part 2: 100% a', [part('part', [composition('a 3b,4c', 100)]), part('part', [composition('a', 100)])])
        });
    });

    describe('part detection by percentage', () => {
        it('should recognize parts that make 100% composition', () => {
            matchesTransform('100% a / 80% b 20% c', [
                part('', [composition('a', 100)]),
                part('', [composition('b', 80), composition('c', 20)])
            ]);
        });
        it('should detect two parts, one should error', () => {
            expect(() => transform('100% a, 99% b')).toThrowError(/Material composition must add up to 100%, instead received: 99%/);
        });
        it('should make sure parts end up exactly 100%', () => {
            expect(() => transform('99% b, 2% c')).toThrowError(/Material composition must add up to 100%, instead received: 101%/);
            expect(() => transform('98% a, 1% b')).toThrowError(/Material composition must add up to 100%, instead received: 99%/);
        });
    });

    describe('part detection by guess', () => {
        it('bad delimiters for compositions', () => {
            matchesTransform('60% a; 40% b; 100% c', [
                part('', [composition('a', 60), composition('b', 40)]),
                part('', [composition('c', 100)])
            ]);
        });
        it('composition without percentage', () => {
            matchesTransform('60 a 40 b 100 c', [
                part('', [composition('a', 60), composition('b', 40)]),
                part('', [composition('c', 100)])
            ]);
        });
        it('composition with percentage and extra characters', () => {
            matchesTransform('60 a 40 b; 100 c', [
                part('', [composition('a', 60), composition('b', 40)]),
                part('', [composition('c', 100)])
            ]);
        });
    });

    describe('error handling', () => {
        it('should throw an error if two consecutive numbers are given', () => {
            expect(() => transform('a 1% 2%')).toThrowError(/Parsing error: two adjacent tokens of type number detected/);
        });
        it('should have the original input in the error', () => {
            expect(() => transform('a 1% 2%')).toThrowError(/input: "a 1% 2%"/);
        });
        it('should throw an error if a material without percentage is given', () => {
            expect(() => transform('a(a'), ).toThrowError(/A material implies one more token, none was found/);
        });
    })
});
