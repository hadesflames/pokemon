import Type from '../Type';
import Bug from './Bug';
import Grass from './Grass';
import Flying from './Flying';
import Electric from './Electric';
import Fire from './Fire';
import Poison from './Poison';
import Rock from './Rock';
import Steel from './Steel';

export default class Ground extends Type{
	multiplier(type: Type){
		if(type instanceof Bug){
			return 0.5;
		}else if(type instanceof Grass){
			return 0.5;
		}else if(type instanceof Electric){
			return 2;
		}else if(type instanceof Fire){
			return 2;
		}else if(type instanceof Poison){
			return 2;
		}else if(type instanceof Rock){
			return 2;
		}else if(type instanceof Steel){
			return 2;
		}else if(type instanceof Flying){
			return 0;
		}

		return 1;
	}
}