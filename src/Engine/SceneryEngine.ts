import Objects, { IObject } from './Objects';
import Game from '../Game';
import { ICoordinates } from './Player';

export default class SceneryEngine{
	private static SceneryEngine: SceneryEngine;
	private processing: boolean = false;
	private onscreen: IDrawnObject = {};
	private constructor(){}

	static getSceneryEngine(): SceneryEngine{
		if(SceneryEngine.SceneryEngine == null){
			SceneryEngine.SceneryEngine = new SceneryEngine();
		}

		return SceneryEngine.SceneryEngine;
	}

	async process(){
		if(this.processing) return;
		this.processing = true;
		const playerCoords: ICoordinates = Game.getGame().getPlayerCoords();
		const objs: Set<unknown> = Objects.getNearbyObjects(playerCoords);
		for(const obj of objs){
			const gameObject: IObject = obj as IObject;
			if((gameObject.geometry.pos.x >= playerCoords.x - 9 && gameObject.geometry.pos.x <= playerCoords.x + 8) &&
				(gameObject.geometry.pos.y >= playerCoords.y - 8 && gameObject.geometry.pos.y >= playerCoords.y + 6) && !this.isDrawn(gameObject.geometry.pos)){
				// Draw scenery.
			}
		}
		this.processing = false;
	}

	private isDrawn(coords: ICoordinates): boolean{
		const key: string = coords.x + ',' + coords.y;
		return (key in this.onscreen);
	}
}

interface IDrawnObject{
	[index: string]: IObject;
}