import Common from '../util/Common';
import Game from '../Game';
import * as PIXI from 'pixi.js';
import Collision from './Collision';
import PokeText from '../util/PokeText';

export class Player{
	private name: string;
	private faceDirection: PlayerFaceDirection;
	private coords: ICoordinates;
	private sprite: PIXI.Sprite;
	private animatedSprite: PIXI.AnimatedSprite | null;
	private spriteTextures: PIXI.ITextureDictionary;
	private spriteSheet: PIXI.Spritesheet | null;
	private moving: boolean = false;
	private isMoving: boolean = false;
	private stopMove: boolean = false;
	private changeDirectionCommand: boolean = false;
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

	constructor(name: string, x: number, y: number){
		this.name = name;
		this.faceDirection = PlayerFaceDirection.DOWN;
		this.coords = {x: x, y: y};
		this.sprite = new PIXI.Sprite();
		this.animatedSprite = null;
		this.spriteTextures = {};
		this.spriteSheet = null;
	}

	loadSprite(resource: PIXI.LoaderResource): PIXI.Sprite{
		const textures: PIXI.ITextureDictionary = resource.textures as PIXI.ITextureDictionary;
		this.sprite = new PIXI.Sprite(textures[PlayerFaceDirectionTexture[this.faceDirection]]);
		this.sprite.name = 'PLAYER';
		this.sprite.x = 400;
		this.sprite.y = 300;
		this.sprite.zIndex = 1;
		this.sprite.scale.set(3, 3);
		this.spriteTextures = textures;
		this.spriteSheet = resource.spritesheet as PIXI.Spritesheet;
		this.addTextBubble();
		this.screen_text_next = new PIXI.Sprite(Game.getGame().getResource('arrow')?.texture);
		this.screen_text_next.zIndex = 3;
		this.screen_text_next.scale.set(3, 3);
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

	async move(direction: PlayerFaceDirection){
		if(this.isMoving || this.changeDirectionCommand || this.is_reading){
			return;
		}

		if(this.faceDirection !== direction && !this.moving){
			this.sprite.texture = this.spriteTextures[PlayerFaceDirectionTexture[this.faceDirection]];
			this.faceDirection = direction;
			await Common.delay(50);
		}

		if(this.stopMove){
			this.stopMove = false;
			return;
		}

		if(!this.moving){
			this.sprite.visible = false;
			Game.getGame().removeSprite(this.animatedSprite as PIXI.AnimatedSprite);
			this.animatedSprite = new PIXI.AnimatedSprite(this.spriteSheet?.animations[PlayerFaceDirectionTexture[direction]]);
			this.animatedSprite.name = 'PLAYER';
			this.animatedSprite.animationSpeed = 4 / Game.FPS; // 4fps
			this.animatedSprite.scale.set(3, 3);
			this.animatedSprite.zIndex = 1;
			this.animatedSprite.play();
			this.animatedSprite.x = 400;
			this.animatedSprite.y = 300;
			Game.getGame().addSprite(this.animatedSprite);
		}

		this.moving = this.isMoving = true;
		await Game.getGame().move(direction === PlayerFaceDirection.DOWN || direction === PlayerFaceDirection.RIGHT ? 1 : -1,
									direction === PlayerFaceDirection.LEFT || direction === PlayerFaceDirection.RIGHT);
		this.isMoving = false;
		this.stopMove = false;
	}

	stopMovement(){
		if(this.animatedSprite){
			this.animatedSprite.destroy();
			Game.getGame().removeSprite(this.animatedSprite);
			this.animatedSprite = null;
		}

		this.sprite.texture = this.spriteTextures[PlayerFaceDirectionTexture[this.faceDirection]];
		this.sprite.visible = true;
		this.moving = this.isMoving = false;
		this.stopMove = true;
	}

	handleAPress(){
		if(this.inOverWorld){
			if(this.menuOpen){
			}else{
				if(this.is_reading){
					this.displayMessage();
				}else{
					const pos: ICoordinates = { x: this.coords.x, y: this.coords.y - 1 };
					const msg = Collision.checkForMessage(pos);
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
			spr.zIndex = 2;
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
		this.screen_text.zIndex = 3;
		Game.getGame().addSprite(this.screen_text);
		if(this.cur_msg < this.messages.length - 1)
			this.addNextIndicator();

		this.cur_msg++;
	}

	private addNextIndicator(){
		this.screen_text_next.x = (this.screen_text ? this.screen_text.x : 0) + (this.screen_text ? this.screen_text.width : 0);
		this.screen_text_next.y = (this.screen_text ? this.screen_text.y : 0);
		this.screen_text_next.visible = true;
		this.screen_text_next_timeout = setTimeout(() => this.screenTextNextAnim(), 100);
	}

	private screenTextNextAnim(){
		this.screen_text_next.y += this.screen_text_next_num;
		if(((this.screen_text ? this.screen_text.y : 0) + 5) <= this.screen_text_next.y || this.screen_text_next.y === (this.screen_text ? this.screen_text.y : 0)){
			this.screen_text_next_num *= -1;
		}
		this.screen_text_next_timeout = setTimeout(() => this.screenTextNextAnim(), 100);
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

export const PlayerFaceDirectionTexture = {
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down'
};