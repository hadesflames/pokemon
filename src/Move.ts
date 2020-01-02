import Type from './Type';
import Common from './util/Common';

export default class Move{
	private type: Type;
	private isSpec: boolean;
	private power: number;
	private accuracy: number;
	private base_stage: number;
	constructor(type: Type, power: number, accuracy: number, isSpec: boolean, base_stage: number = 0){
		this.type = type;
		this.power = power;
		this.accuracy = accuracy;
		this.isSpec = isSpec;
		this.base_stage = base_stage;
	}

	getType(): Type{
		return this.type;
	}

	getPower(): number{
		return this.power;
	}

	getAccuracy(): number{
		return this.accuracy;
	}

	isSpecial(): boolean{
		return this.isSpec;
	}

	calculateCritical(): number{
		// TODO: Implement stage modifiers.
		if(this.base_stage === 0){
			return Common.random(1, 24) === 1 ? 1.5 : 1;
		}else if(this.base_stage === 1){
			return Common.random(1, 8) === 1 ? 1.5 : 1;
		}else if(this.base_stage === 2){
			return Common.random(1, 2) === 1 ? 1.5 : 1;
		}

		return 1.5;
	}
}