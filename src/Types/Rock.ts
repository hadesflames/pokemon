import Type from '../Type';
import Fighting from './Fighting';
import Ground from './Ground';
import Steel from './Steel';
import Bug from './Bug';
import Fire from './Fire';
import Flying from './Flying';
import Ice from './Ice';

export default class Rock extends Type{
	multiplier(type: Type){
		if(type instanceof Fighting){
			return 0.5;
		}else if(type instanceof Ground){
			return 0.5;
		}else if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Bug){
			return 2;
		}else if(type instanceof Fire){
			return 2;
		}else if(type instanceof Flying){
			return 2;
		}else if(type instanceof Ice){
			return 2;
		}

		return 1;
	}
}