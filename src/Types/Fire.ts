import Type from '../Type';
import Dragon from './Dragon';
import Rock from './Rock';
import Water from './Water';
import Bug from './Bug';
import Grass from './Grass';
import Ice from './Ice';
import Steel from './Steel';

export default class Fire extends Type{
	multiplier(type: Type){
		if(type instanceof Dragon){
			return 0.5;
		}else if(type instanceof Fire){
			return 0.5;
		}else if(type instanceof Rock){
			return 0.5;
		}else if(type instanceof Water){
			return 0.5;
		}else if(type instanceof Bug){
			return 2;
		}else if(type instanceof Grass){
			return 2;
		}else if(type instanceof Ice){
			return 2;
		}else if(type instanceof Steel){
			return 2;
		}

		return 1;
	}
}