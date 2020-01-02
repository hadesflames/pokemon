import Move from '../Move';
import PsychicType from '../Types/Psychic';

export default class Psychic extends Move{
	constructor(){
		super(new PsychicType, 90, 100, true);
	}
}