import Common from '../util/Common';
import Game from '../Game';
import * as PIXI from 'pixi.js';
import Collision from './Collision';

export class Player{
	private faceDirection: PlayerFaceDirection;
	private coords: ICoordinates;
	private sprite: PIXI.Sprite;
	private moving: boolean = false;
	private isMoving: boolean = false;
	private movingNext: boolean = false;
	private stopMove: boolean = false;
	private changeDirectionCommand: boolean = false;
	private inOverWorld: boolean = true;
	private menuOpen: boolean = false;

	constructor(x: number, y: number){
		this.faceDirection = PlayerFaceDirection.DOWN;
		this.coords = {x: x, y: y};
		this.sprite = new PIXI.Sprite();
	}

	loadSprite(texture: PIXI.Texture): PIXI.Sprite{
		const rectangle: PIXI.Rectangle = new PIXI.Rectangle(PlayerFaceDirectionCoord[this.faceDirection], 0, 16, 32);
		texture.frame = rectangle;
		this.sprite = new PIXI.Sprite(texture);
		this.sprite.x = 400;
		this.sprite.y = 300;
		this.sprite.scale.set(3, 3);
		return this.sprite;
	}

	getCoords(): ICoordinates{
		return this.coords;
	}

	getX(): number{
		return this.coords.x;
	}

	getY(): number{
		return this.coords.y;
	}

	async move(direction: PlayerFaceDirection){
		if(this.isMoving || this.changeDirectionCommand){
			return;
		}

		if(this.faceDirection !== direction && !this.moving){
			this.sprite.texture = new PIXI.Texture(this.sprite.texture.baseTexture, new PIXI.Rectangle(PlayerFaceDirectionCoord[direction], 0, 16, 32));
			this.faceDirection = direction;
			await Common.delay(50);
		}

		/*if(this.stopMove){
			this.stopMove = false;
			return;
		}*/

		this.moving = this.isMoving = true;
		this.sprite.texture = new PIXI.Texture(this.sprite.texture.baseTexture, new PIXI.Rectangle(PlayerMoveCoord[direction][this.movingNext ? 0 : 1], 0, 16, 32));
		this.movingNext = !this.movingNext;
		this.coords = await Game.getGame().move(direction === PlayerFaceDirection.DOWN || direction === PlayerFaceDirection.RIGHT ? 1 : -1,
									direction === PlayerFaceDirection.LEFT || direction === PlayerFaceDirection.RIGHT);
		this.isMoving = false;
		this.stopMove = false;
	}

	stopMovement(){
		this.sprite.texture = new PIXI.Texture(this.sprite.texture.baseTexture, new PIXI.Rectangle(PlayerFaceDirectionCoord[this.faceDirection], 0, 16, 32));
		this.moving = this.movingNext = this.isMoving = false;
		this.stopMove = true;
	}

	handleAPress(){
		if(this.inOverWorld){
			if(this.menuOpen){
			}else{
				const pos: ICoordinates = { x: this.coords.x, y: this.coords.y - 1 };
				const msg = Collision.checkForMessage(pos);
				if(msg != null){
					for(const m of msg){
						alert(m);
					}
				}
			}
		}
	}

	handleBPress(){
		return;
	}

	handleEnterPress(){
		return;
	}
}

export interface ICoordinates{
	x: number;
	y: number;
}

export enum PlayerFaceDirection{
	LEFT = 37,
	UP = 38,
	RIGHT = 39,
	DOWN = 40
}

export const PlayerFaceDirectionCoord = {
	LEFT: 32,
	UP: 16,
	RIGHT: 146,
	DOWN: 0,
	37: 32,
	38: 16,
	39: 146,
	40: 0
};

const PlayerMoveCoord = {
	LEFT: [130, 114],
	UP: [98, 82],
	RIGHT: [178, 162],
	DOWN: [65, 48],
	37: [130, 114],
	38: [98, 82],
	39: [178, 162],
	40: [65, 48]
};