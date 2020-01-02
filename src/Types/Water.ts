import Type from '../Type';
import Dragon from './Dragon';
import Grass from './Grass';
import Fire from './Fire';
import Ground from './Ground';
import Rock from './Rock';

export default class Water extends Type{
	multiplier(type: Type){
		if(type instanceof Dragon){
			return 0.5;
		}else if(type instanceof Grass){
			return 0.5;
		}else if(type instanceof Water){
			return 0.5;
		}else if(type instanceof Fire){
			return 2;
		}else if(type instanceof Ground){
			return 2;
		}else if(type instanceof Rock){
			return 2;
		}

		return 1;
	}
}