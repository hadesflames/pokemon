import * as PIXI from 'pixi.js';
import Objects, { IObject } from './Objects';
import Game, { SkipSprite } from '../Game';
import { ICoordinates, Rectangle } from '../util/Geometry';

export default class SceneryEngine{
	private static SceneryEngine: SceneryEngine;
	private onscreen: IDrawnObject = {};
	private drawnSprites: IDrawnSprite[] = [];
	private grass_sprite_end: SkipSprite;
	private constructor(){
		this.grass_sprite_end = new SkipSprite((Game.getGame().getResource('tall_grass')?.textures as PIXI.ITextureDictionary)['4']);
		this.grass_sprite_end.skipMove = true;
		this.grass_sprite_end.zIndex = 3;
		this.grass_sprite_end.x = 400;
		this.grass_sprite_end.y = 348;
		this.grass_sprite_end.scale.set(3, 3);
		this.grass_sprite_end.visible = false;
		Game.getGame().addSprite(this.grass_sprite_end);
	}

	static getSceneryEngine(): SceneryEngine{
		if(SceneryEngine.SceneryEngine == null){
			SceneryEngine.SceneryEngine = new SceneryEngine();
		}

		return SceneryEngine.SceneryEngine;
	}

	process(){
		this.handleGrass();
		const newDrawnSprites: IDrawnSprite[] = [];
		for(const drawnSprite of this.drawnSprites){
			if(--drawnSprite.kill === 0){
				Game.getGame().removeSprite(drawnSprite.sprite);
				if(drawnSprite.next != null && drawnSprite.next.length > 0){
					for(const next of drawnSprite.next){
						next.sprite.x = drawnSprite.sprite.x;
						next.sprite.y = drawnSprite.sprite.y;
						Game.getGame().addSprite(next.sprite);
						newDrawnSprites.push(next);
						if(next.sprite instanceof PositionedAnimatedSprite){
							(next.sprite as PositionedAnimatedSprite).play();
						}
					}
				}
			}else if(drawnSprite.killOffPlayer){
				if(Game.getGame().getPlayerCoords().x !== drawnSprite.sprite.coords.x || Game.getGame().getPlayerCoords().y !== drawnSprite.sprite.coords.y){
					Game.getGame().removeSprite(drawnSprite.sprite);
					if(drawnSprite.next != null && drawnSprite.next.length > 0){
						for(const next of drawnSprite.next){
							next.sprite.x = drawnSprite.sprite.x;
							next.sprite.y = drawnSprite.sprite.y;
							Game.getGame().addSprite(next.sprite);
							newDrawnSprites.push(next);
							if(next.sprite instanceof PositionedAnimatedSprite){
								(next.sprite as PositionedAnimatedSprite).play();
							}
						}
					}
				}
			}else if(drawnSprite.sprite.visible){
				newDrawnSprites.push(drawnSprite);
			}
		}
		this.drawnSprites = newDrawnSprites;
		if(!Game.getGame().isPlayerMoving()){
			const playerCoords: ICoordinates = Game.getGame().getPlayerCoords();
			const objs: Set<unknown> = Objects.getNearbyObjects(playerCoords);
			for(const obj of objs){
				const gameObject: IObject = obj as IObject;
				if(gameObject.sprite && this.onScreen(gameObject, playerCoords) && !this.isDrawn(gameObject.geometry.pos)){
					const resource: PIXI.LoaderResource | null = Game.getGame().getResource(gameObject.sprite);
					if(resource){
						const sprite: PIXI.Sprite | PIXI.AnimatedSprite = gameObject.isAnimated ?
																			new PIXI.AnimatedSprite(resource.spritesheet?.animations.anim) :
																			new PIXI.Sprite(resource.texture);
						const xDelta: number = gameObject.geometry.pos.x - playerCoords.x;
						const yDelta: number = gameObject.geometry.pos.y - playerCoords.y;
						sprite.x = 400 + (48 * xDelta) + (gameObject.geometry.delta ? gameObject.geometry.delta.x : 0);
						sprite.y = 348 + (48 * yDelta) + (gameObject.geometry.delta ? gameObject.geometry.delta.y : 0);
						sprite.zIndex = 3;
						sprite.scale.set(3, 3);
						if(gameObject.isAnimated){
							(sprite as PIXI.AnimatedSprite).loop = true;
						}
						Game.getGame().addSprite(sprite);
						const key: string = gameObject.geometry.pos.x + ',' + gameObject.geometry.pos.y;
						this.onscreen[key] = gameObject;
					}
				}
			}
		}
	}

	private onScreen(obj: IObject, playerCoords: ICoordinates): boolean{
		const screen: Rectangle = new Rectangle(playerCoords.x - 9, playerCoords.y - 8, 17, 13);
		const objRect: Rectangle = Rectangle.fromObject(obj);
		return screen.intersects(objRect);
	}

	private isDrawn(coords: ICoordinates): boolean{
		const key: string = coords.x + ',' + coords.y;
		return (key in this.onscreen);
	}

	public removeGrassSprite(){
		this.grass_sprite_end.visible = false;
	}

	handleGrass(){
		const movingTo: ICoordinates | null = Game.getGame().getPlayerMovingTo();
		const playerCoords: ICoordinates = Game.getGame().getPlayerCoords();
		if(movingTo != null){
			const tile: IObject | null = Objects.checkTileObject(movingTo);
			if(tile == null || !tile.isGrass){
				return;
			}

			const x: boolean = movingTo.x !== playerCoords.x;
			const amount = movingTo.x !== playerCoords.x ? (movingTo.x < playerCoords.x ? -1 : 1) : (movingTo.y < playerCoords.y ? -1 : 1);
			const grass_sprite = new PositionedSprite(movingTo, Game.getGame().getResource('tall_grass')?.textures?.init);
			grass_sprite.scale.set(3, 3);
			grass_sprite.zIndex = 0;
			grass_sprite.x = 400 + ((amount > 0 ? 1 : -1) * 48 * (x ? 1 : 0));
			grass_sprite.y = 348 + ((amount > 0 ? 1 : -1) * 48 * (x ? 0 : 1));
			grass_sprite.visible = true;

			const animatedGrass = new PositionedAnimatedSprite(movingTo, Game.getGame().getResource('tall_grass')?.spritesheet?.animations.anim);
			animatedGrass.loop = false;
			animatedGrass.visible = true;
			animatedGrass.zIndex = 3;
			animatedGrass.scale.set(3, 3);
			animatedGrass.animationSpeed = 10 / Game.FPS; // 4fps
			animatedGrass.onComplete = () => {
				animatedGrass.visible = false;
				const movingToNew: ICoordinates | null = Game.getGame().getPlayerMovingTo();
				const new_tile: IObject | null = Objects.checkTileObject(movingToNew ? movingToNew : Game.getGame().getPlayerCoords());
				if(new_tile != null && new_tile.isGrass){
					this.grass_sprite_end.visible = true;
				}
				Game.getGame().removeSprite(animatedGrass);
			};

			this.drawnSprites.push({
				kill: 10,
				killOffPlayer: false,
				sprite: grass_sprite,
				next: [
					{
						kill: 0,
						killOffPlayer: false,
						sprite: animatedGrass,
						next: null
					}
				]
			});
			Game.getGame().addSprite(grass_sprite);
		}
	}
}

export class PositionedSprite extends PIXI.Sprite{
	coords: ICoordinates;
	constructor(coords: ICoordinates, texture?: PIXI.Texture){
		super(texture);
		this.coords = coords;
	}
}

export class PositionedAnimatedSprite extends PIXI.AnimatedSprite{
	coords: ICoordinates;
	constructor(coords: ICoordinates, textures: PIXI.Texture[] | PIXI.AnimatedSprite.FrameObject[], autoUpdate?: boolean | undefined){
		super(textures, autoUpdate);
		this.coords = coords;
	}
}

interface IDrawnSprite{
	kill: number;
	killOffPlayer: boolean;
	sprite: PositionedSprite | PositionedAnimatedSprite;
	next: IDrawnSprite[] | null;
}

interface IDrawnObject{
	[index: string]: IObject;
}