import Type from './Type';
import Move from './Move';
import { StatusCondition } from './StatusCondition';

export default class Pokemon{
	private type: Type;
	private type2: Type;
	private level: number;
	private stats: Stats;
	private status: StatusCondition;
	constructor(type: Type, type2: Type, level: number, stats: Stats, status: StatusCondition){
		this.type = type;
		this.type2 = type2;
		this.level = level;
		this.stats = stats;
		this.status = status;
	}

	getType(): Type{
		return this.type;
	}

	getType2(): Type{
		return this.type2;
	}

	getLevel(): number{
		return this.level;
	}

	isStab(move: Move): boolean{
		return false;
	}

	isBurned(): boolean{
		return this.status === StatusCondition.Burned;
	}

	getPower(move: Move): number{
		if(move.isSpecial()){
			return this.stats.SpecAttack;
		}
		return this.stats.Attack;
	}

	getDefense(move: Move): number{
		if(move.isSpecial()){
			return this.stats.SpecDefense;
		}
		return this.stats.Defense;
	}

	takeDamage(dmg: number, crit: boolean, type_multiplier: number){
		this.stats.HP -= dmg;
		if(this.stats.HP <= 0){
			this.stats.HP = 0;
			// TODO: Feinted?
		}

		if(crit){
			// TODO: Critical hit msg.
		}

		if(type_multiplier === 0){
			// TODO: No effect msg.
		}else if(type_multiplier < 1){
			// TODO: Not very effective msg.
		}else if(type_multiplier > 1){
			// TODO: Super effective msg.
		}
	}
}

export interface Stats{
	HP: number;
	MaxHP: number;
	Attack: number;
	Defense: number;
	SpecAttack: number;
	SpecDefense: number;
	Speed: number;
}