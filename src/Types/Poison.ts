import Type from '../Type';
import Ground from './Ground';
import Rock from './Rock';
import Steel from './Steel';
import Ghost from './Ghost';
import Fairy from './Fairy';
import Grass from './Grass';

export default class Poison extends Type{
	multiplier(type: Type){
		if(type instanceof Poison){
			return 0.5;
		}else if(type instanceof Ground){
			return 0.5;
		}else if(type instanceof Rock){
			return 0.5;
		}else if(type instanceof Ghost){
			return 0.5;
		}else if(type instanceof Fairy){
			return 2;
		}else if(type instanceof Grass){
			return 2;
		}else if(type instanceof Steel){
			return 0;
		}

		return 1;
	}
}