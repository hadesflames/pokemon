import Dark from './Dark';
import Dragon from './Dragon';
import Fighting from './Fighting';
import Fire from './Fire';
import Poison from './Poison';
import Steel from './Steel';
import Type from '../Type';

export default class Fairy extends Type{
	multiplier(type: Type){
		if(type instanceof Fire){
			return 0.5;
		}else if(type instanceof Poison){
			return 0.5;
		}else if(type instanceof Steel){
			return 0.5;
		}else if(type instanceof Fighting){
			return 2;
		}else if(type instanceof Dragon){
			return 2;
		}else if(type instanceof Dark){
			return 2;
		}

		return 1;
	}
}