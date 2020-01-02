import Fairy from './Fairy';
import Steel from './Steel';
import Type from '../Type';

export default class Dragon extends Type{
	multiplier(type: Type){
		if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Dragon){
			return 2;
		}else if(type instanceof Fairy){
			return 0;
		}

		return 1;
	}
}