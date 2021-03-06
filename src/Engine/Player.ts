import Common from '../util/Common';
import Game, { IScale } from '../Game';
import * as PIXI from 'pixi.js';
import Objects, { IObject } from './Objects';
import PokeText from '../util/PokeText';
import { ICoordinates } from '../util/Geometry';
import SceneryEngine from './SceneryEngine';

export class Player{
	private name: string;
	private faceDirection: PlayerFaceDirection;
	private coords: ICoordinates;
	private movingTo: ICoordinates | null = null;
	private sprite: PIXI.Sprite;
	private playerSpriteScale: IScale = {x: 3, y: 3};
	private animatedSprite: PIXI.AnimatedSprite | null;
	private spriteTextures: PIXI.ITextureDictionary;
	private spriteSheet: PIXI.Spritesheet | null;
	private inOverWorld: boolean = true;
	private menuOpen: boolean = false;
	private text_bubble: PIXI.Sprite[] = [];
	private is_reading: boolean = false;
	private messages: string[] = [];
	private cur_msg: number = 0;
	private screen_text?: PokeText;
	private screen_text_next: PIXI.Sprite = new PIXI.Sprite();
	private screen_text_next_timeout?: number;
	private screen_text_next_num: number = 1;
	public vx: number = 0;
	public vy: number = 0;
	private isMoving: boolean = false;
	public stopMove: boolean = false;
	private holdMove: number = 0;
	private animateSprite: boolean = false;
	private isSurfing: boolean = false;

	constructor(name: string, x: number, y: number){
		this.name = name;
		this.faceDirection = PlayerFaceDirection.DOWN;
		this.coords = {x: x, y: y};
		this.sprite = new PIXI.Sprite();
		this.animatedSprite = null;
		this.spriteTextures = {};
		this.spriteSheet = null;
	}

	loadSprite(resource: PIXI.LoaderResource, resourceScale: IScale): PIXI.Sprite{
		const textures: PIXI.ITextureDictionary = resource.textures as PIXI.ITextureDictionary;
		this.sprite = new PIXI.Sprite(textures[PlayerFaceDirectionTexture[this.faceDirection]]);
		this.sprite.name = 'PLAYER';
		this.sprite.x = 400;
		this.sprite.y = 300;
		this.sprite.zIndex = 1;
		this.sprite.scale.set(resourceScale.x, resourceScale.y);
		this.spriteTextures = textures;
		this.spriteSheet = resource.spritesheet as PIXI.Spritesheet;
		this.playerSpriteScale = resourceScale;
		this.addTextBubble();
		const arrowScale: IScale = Game.getGame().getResourceScale('arrow');
		this.screen_text_next = new PIXI.Sprite(Game.getGame().getResource('arrow')?.texture);
		this.screen_text_next.zIndex = 5;
		this.screen_text_next.scale.set(arrowScale.x, arrowScale.y);
		this.screen_text_next.visible = false;
		Game.getGame().addSprite(this.screen_text_next);
		return this.sprite;
	}

	getCoords(): ICoordinates{
		return this.coords;
	}

	setCoords(coords: ICoordinates){
		this.coords = coords;
	}

	getX(): number{
		return this.coords.x;
	}

	getY(): number{
		return this.coords.y;
	}

	getMovingTo(): ICoordinates | null{
		return this.movingTo;
	}

	setMovingTo(movingTo: ICoordinates){
		this.movingTo = movingTo;
	}

	isPlayerMoving(): boolean{
		return this.isMoving;
	}

	isPlayerSurfing(): boolean{
		return this.isSurfing;
	}

	handleMove(){
		if(this.isMoving){
			this.move(this.faceDirection);
			return;
		}

		if(this.vx !== 0){
			this.move(this.vx < 0 ? PlayerFaceDirection.LEFT : PlayerFaceDirection.RIGHT);
		}else if(this.vy !== 0){
			this.move(this.vy < 0 ? PlayerFaceDirection.UP : PlayerFaceDirection.DOWN);
		}else{
			if(this.animatedSprite){
				this.animatedSprite.destroy();
				Game.getGame().removeSprite(this.animatedSprite);
				this.animatedSprite = null;
			}

			this.sprite.texture = this.spriteTextures[PlayerFaceDirectionTexture[this.faceDirection]];
			this.sprite.visible = true;
		}
	}

	doneMoving(nextCoords?: ICoordinates){
		if(nextCoords){
			this.setCoords(nextCoords);
		}

		this.isMoving = false;
		this.movingTo = null;
		const tile: IObject | null = Objects.checkTileObject(this.coords);
		if(tile == null || !tile.isGrass){
			SceneryEngine.getSceneryEngine().removeGrassSprite();
		}
		console.log('x: ' + this.coords.x + ', y: ' + this.coords.y);
	}

	move(direction: PlayerFaceDirection){
		if(this.is_reading || this.holdMove > 0){
			this.holdMove--;
			if(this.holdMove < 0){
				this.holdMove = 0;
			}

			return;
		}

		if(this.isMoving){
			this.movingTo = null;
			Game.getGame().move(0, null);
			return;
		}

		if(this.faceDirection !== direction){
			this.sprite.texture = this.spriteTextures[PlayerFaceDirectionTexture[this.faceDirection]];
			this.faceDirection = direction;
			this.animateSprite = true;
			this.holdMove = 4;
			return;
		}

		const speed: number = this.vx === 0 ? this.vy : this.vx;
		const movingX: boolean = direction === PlayerFaceDirection.LEFT || direction === PlayerFaceDirection.RIGHT;
		this.isMoving = true;
		this.movingTo = {
			x: this.coords.x + ((speed > 0 ? 1 : -1) * (movingX ? 1 : 0)),
			y: this.coords.y + ((speed > 0 ? 1 : -1) * (movingX ? 0 : 1))
		};
		this.sprite.visible = false;
		if(this.animateSprite || !this.animatedSprite){
			if(this.animatedSprite){
				Game.getGame().removeSprite(this.animatedSprite as PIXI.AnimatedSprite);
			}

			this.animatedSprite = new PIXI.AnimatedSprite(this.spriteSheet?.animations[PlayerFaceDirectionTexture[direction]]);
			this.animatedSprite.name = 'PLAYER';
			this.animatedSprite.animationSpeed = 6 / Game.FPS; // 4fps
			this.animatedSprite.scale.set(this.playerSpriteScale.x, this.playerSpriteScale.y);
			this.animatedSprite.zIndex = 1;
			this.animatedSprite.play();
			this.animatedSprite.x = 400;
			this.animatedSprite.y = 300;
			Game.getGame().addSprite(this.animatedSprite);
			this.animateSprite = false;
		}
		SceneryEngine.getSceneryEngine().removeGrassSprite();
		Game.getGame().move((1 / speed), movingX);
	}

	handleAPress(){
		if(this.inOverWorld){
			if(this.menuOpen){
			}else{
				if(this.is_reading){
					this.displayMessage();
				}else{
					const xDelta: number = this.faceDirection === PlayerFaceDirection.LEFT ? -1 : (this.faceDirection === PlayerFaceDirection.RIGHT ? 1 : 0);
					const yDelta: number = this.faceDirection === PlayerFaceDirection.UP ? -1 : (this.faceDirection === PlayerFaceDirection.DOWN ? 1 : 0);
					const pos: ICoordinates = { x: this.coords.x + xDelta, y: this.coords.y + yDelta };
					const msg = Objects.checkForMessage(pos);
					if(msg != null){
						this.displayBubble();
						this.is_reading = true;
						this.cur_msg = 0;
						this.messages = msg;
						this.displayMessage();
					}
				}
			}
		}
	}

	handleBPress(){
		if(this.is_reading){
			this.displayMessage();
		}
	}

	handleEnterPress(){
		return;
	}

	private addTextBubble(){
		const num_mids = 30;
		const tb_textures: PIXI.ITextureDictionary = Game.getGame().getResource('text_bubble')?.textures as PIXI.ITextureDictionary;
		this.text_bubble.push(new PIXI.Sprite(tb_textures.top_left));
		for(let i = 0; i<num_mids; i++)
			this.text_bubble.push(new PIXI.Sprite(tb_textures.top));
		this.text_bubble.push(new PIXI.Sprite(tb_textures.top_right));
		for(let i = 0; i< 4; i++){
			this.text_bubble.push(new PIXI.Sprite(tb_textures.middle_left));
			for(let j = 0; j<num_mids; j++)
				this.text_bubble.push(new PIXI.Sprite(tb_textures.middle));
			this.text_bubble.push(new PIXI.Sprite(tb_textures.middle_right));
		}
		this.text_bubble.push(new PIXI.Sprite(tb_textures.bottom_left));
		for(let i = 0; i<num_mids; i++)
			this.text_bubble.push(new PIXI.Sprite(tb_textures.bottom));
		this.text_bubble.push(new PIXI.Sprite(tb_textures.bottom_right));

		let x = 0, y = 450;
		for(const spr of this.text_bubble){
			spr.x = x + 18;
			spr.y = y;
			spr.zIndex = 5;
			spr.scale.set(3, 3);
			spr.visible = false;
			Game.getGame().addSprite(spr);
			x += spr.width;
			if(x >= ((num_mids * 24) + 42)){
				x = 0;
				y += spr.height;
			}
		}
		console.log('done');
	}

	private displayBubble(){
		for(const spr of this.text_bubble){
			spr.visible = true;
		}
	}

	private displayMessage(){
		if(this.cur_msg >= this.messages.length){
			this.endMessage();
			return;
		}
		const msg: string = this.msgVars(this.messages[this.cur_msg]);
		if(this.screen_text){
			Game.getGame().removeSprite(this.screen_text);
		}
		if(this.screen_text_next){
			this.removeNextIndicator();
		}

		this.screen_text = new PokeText(msg);
		this.screen_text.x = 50;
		this.screen_text.y = 480;
		this.screen_text.zIndex = 6;
		Game.getGame().addSprite(this.screen_text);
		if(this.cur_msg < this.messages.length - 1)
			this.addNextIndicator();

		this.cur_msg++;
	}

	private addNextIndicator(){
		this.screen_text_next.x = (this.screen_text ? this.screen_text.x : 0) + (this.screen_text ? this.screen_text.width : 0);
		this.screen_text_next.y = (this.screen_text ? this.screen_text.y : 0);
		this.screen_text_next.visible = true;
		this.screen_text_next_timeout = setTimeout(() => this.screenTextNextAnim(), 75);
	}

	private screenTextNextAnim(){
		this.screen_text_next.y += this.screen_text_next_num;
		if(((this.screen_text ? this.screen_text.y : 0) + 5) <= this.screen_text_next.y || this.screen_text_next.y === (this.screen_text ? this.screen_text.y : 0)){
			this.screen_text_next_num *= -1;
		}
		this.screen_text_next_timeout = setTimeout(() => this.screenTextNextAnim(), 75);
	}

	private removeNextIndicator(){
		this.screen_text_next.visible = false;
		this.screen_text_next_num = 1;
		if(this.screen_text_next_timeout != null){
			clearTimeout(this.screen_text_next_timeout);
		}

		this.screen_text_next_timeout = undefined;
	}

	private endMessage(){
		this.cur_msg = 0;
		this.messages = [];
		this.is_reading = false;
		if(this.screen_text){
			Game.getGame().removeSprite(this.screen_text);
			this.screen_text = undefined;
		}

		for(const spr of this.text_bubble){
			spr.visible = false;
		}
	}

	private msgVars(msg: string){
		return msg.replace('%PLAYER%', this.name);
	}
}

export enum PlayerFaceDirection{
	LEFT = 37,
	UP = 38,
	RIGHT = 39,
	DOWN = 40
}

export const PlayerFaceDirectionTexture = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
};