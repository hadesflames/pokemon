import Type from '../Type';
import Bug from './Bug';
import Dragon from './Dragon';
import Fire from './Fire';
import Flying from './Flying';
import Poison from './Poison';
import Steel from './Steel';
import Ground from './Ground';
import Rock from './Rock';
import Water from './Water';

export default class Grass extends Type{
	multiplier(type: Type){
		if(type instanceof Bug){
			return 0.5;
		}else if(type instanceof Dragon){
			return 0.5;
		}else if(type instanceof Fire){
			return 0.5;
		}else if(type instanceof Flying){
			return 0.5;
		}else if(type instanceof Grass){
			return 0.5;
		}else if(type instanceof Poison){
			return 0.5;
		}else if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Ground){
			return 2;
		}else if(type instanceof Rock){
			return 2;
		}else if(type instanceof Water){
			return 2;
		}

		return 1;
	}
}