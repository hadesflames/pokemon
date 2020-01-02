import * as PIXI from 'pixi.js';

export default class PokeText extends PIXI.Text{
	constructor(text: string){
		super(text, {
			fontFamily: 'pokefont',
			fontSize: 62
		});
	}
}