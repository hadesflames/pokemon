import Pokemon, { Stats } from '../Pokemon';
import Psychic from '../Types/Psychic';
import Type from '../Type';
import Move from '../Move';
import { StatusCondition } from '../StatusCondition';

export default class Kadabra extends Pokemon{
	constructor(level: number, stats: Stats, status: StatusCondition){
		super(new Psychic, new Type, level, stats, status);
	}

	isStab(move: Move): boolean{
		return (move.getType() instanceof Psychic);
	}
}