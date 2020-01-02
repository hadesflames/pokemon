import Type from '../Type';
import Electric from './Electric';
import Fire from './Fire';
import Water from './Water';
import Fairy from './Fairy';
import Ice from './Ice';
import Rock from './Rock';

export default class Steel extends Type{
	multiplier(type: Type){
		if(type instanceof Electric){
			return 0.5;
		}else if(type instanceof Fire){
			return 0.5;
		}else if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Water){
			return 0.5;
		}else if(type instanceof Fairy){
			return 2;
		}else if(type instanceof Ice){
			return 2;
		}else if(type instanceof Rock){
			return 2;
		}

		return 1;
	}
}