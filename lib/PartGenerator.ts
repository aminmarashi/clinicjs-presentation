import { Token, Part } from './types';

export class PartGenerator {
    private parts;
    private currentPart;

    public generateParts(tokens: Token[]): Part[] {
        this.parts = [];
        this.currentPart = { partName: '', composition: [], totalPercentage: 0 };

        for (let i = 0; i < tokens.length; i++) {
            const { type, value } = tokens[i];
            if (type === 'part') {
                this.saveAndReplaceCurrentPart(value);
                continue;
            } else if (this.currentPart.totalPercentage === 100) {
                this.saveAndReplaceCurrentPart('');
            }
            if (i === tokens.length - 1) {
                throw Error(`A ${type} implies one more token, none was found`);
            }
            if (type === 'percentage') {
                this.addComposition({
                    percentage: value,
                    material: tokens[++i].value
                });
            } else if (type === 'material') {
                this.addComposition({
                    percentage: tokens[++i].value,
                    material: value
                });
            }
        }
        this.saveCurrentPart();
        return this.parts;
    }

    private replaceCurrentPart(value = '') {
        this.currentPart = {
            partName: value,
            composition: [],
            totalPercentage: 0
        };
    };

    private saveAndReplaceCurrentPart(value) {
        this.saveCurrentPart();
        this.replaceCurrentPart(value);
    };

    private saveCurrentPart() {
        if (this.currentPart.composition.length) {
            if (this.currentPart.totalPercentage < 100) {
                throw Error(`Material composition must add up to 100%, instead received: ${this.currentPart.totalPercentage}%`);
            }
            this.parts.push({
                partName: this.currentPart.partName,
                composition: this.currentPart.composition
            });
        }
    };

    private addComposition({ percentage, material }) {
        this.currentPart.composition.push({
            percentage,
            material
        });
        this.currentPart.totalPercentage += Number(percentage);
        if (this.currentPart.totalPercentage > 100) {
            throw Error(`Material composition must add up to 100%, instead received: ${this.currentPart.totalPercentage}%`);
        }
    };
}
