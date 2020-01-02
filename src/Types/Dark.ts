import Fairy from './Fairy';
import Fighting from './Fighting';
import Ghost from './Ghost';
import Psychic from './Psychic';
import Type from '../Type';

export default class Dark extends Type{
	multiplier(type: Type): number{
		if(type instanceof Fighting){
			return 0.5;
		}else if(type instanceof Fairy){
			return 0.5;
		}else if(type instanceof Dark){
			return 0.5;
		}else if(type instanceof Psychic){
			return 2;
		}else if(type instanceof Ghost){
			return 2;
		}

		return 1;
	}
}