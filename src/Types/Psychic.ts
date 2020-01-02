import Dark from './Dark';
import Fighting from './Fighting';
import Poison from './Poison';
import Steel from './Steel';
import Type from '../Type';

export default class Psychic extends Type{
	multiplier(type: Type){
		if(type instanceof Fighting){
			return 2;
		}else if(type instanceof Poison){
			return 2;
		}else if(type instanceof Psychic){
			return 0.5;
		}else if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Dark){
			return 0;
		}

		return 1;
	}
}