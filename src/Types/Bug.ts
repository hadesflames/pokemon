import Type from '../Type';
import Fairy from './Fairy';
import Fighting from './Fighting';
import Fire from './Fire';
import Flying from './Flying';
import Ghost from './Ghost';
import Poison from './Poison';
import Steel from './Steel';
import Dark from './Dark';
import Psychic from './Psychic';
import Grass from './Grass';

export default class Bug extends Type{
	multiplier(type: Type): number{
		if(type instanceof Fairy){
			return 0.5;
		}else if(type instanceof Fighting){
			return 0.5;
		}else if(type instanceof Fire){
			return 0.5;
		}else if(type instanceof Flying){
			return 0.5;
		}else if(type instanceof Ghost){
			return 0.5;
		}else if(type instanceof Poison){
			return 0.5;
		}else if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Dark){
			return 2;
		}else if(type instanceof Grass){
			return 2;
		}else if(type instanceof Psychic){
			return 2;
		}

		return 1;
	}
}