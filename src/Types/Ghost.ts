import Type from '../Type';
import Dark from './Dark';
import Psychic from './Psychic';
import Normal from './Normal';

export default class Ghost extends Type{
	multiplier(type: Type){
		if(type instanceof Dark){
			return 0.5;
		}else if(type instanceof Ghost){
			return 2;
		}else if(type instanceof Psychic){
			return 2;
		}else if(type instanceof Normal){
			return 0;
		}

		return 1;
	}
}