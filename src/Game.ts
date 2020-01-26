import * as PIXI from 'pixi.js';
import { Player, PlayerFaceDirection, ICoordinates } from './Engine/Player';
import Common from './util/Common';
import Objects, { IObject } from './Engine/Objects';
import SceneryEngine from './Engine/SceneryEngine';
import Keypress from './Engine/Keypress';

export default class Game{
	static readonly FPS: number = 60;
	private static GAME: Game;

	private loaded: boolean = false;
	private loading: boolean = false;
	private app: PIXI.Application;
	private loader: PIXI.Loader;
	private player: Player;
	private overWorld: PIXI.Container;
	private overWorldSprite: PIXI.Sprite;
	private animatedGrass?: PIXI.AnimatedSprite;
	private grass_sprite: PIXI.Sprite;
	private grass_sprite2: SkipSprite;
	private last_move: number = 0;
	private last_move_x: boolean = false;

	private constructor(){
		this.app = new PIXI.Application({width: 800, height: 600});
		this.loader = new PIXI.Loader();
		this.player = new Player('Aldo', 66, 268);
		this.overWorld = new PIXI.Container();
		this.overWorldSprite = this.grass_sprite = new PIXI.Sprite();
		this.grass_sprite2 = new SkipSprite();
		document.body.appendChild(this.app.view);
	}

	static getGame(): Game{
		if(Game.GAME == null){
			Game.GAME = new Game();
		}

		return Game.GAME;
	}

	loadGame(){
		if(this.loaded || this.loading){
			return;
		}

		document.getElementById('loading')?.remove();
		this.loading = true;
		Objects.loadObjects();
		this.loader.add('overworld', '../assets/world.png')
					.add('char_anim', '../assets/char/char.json')
					.add('tall_grass', '../assets/tall_grass/tall_grass.json')
					.add('text_bubble', '../assets/menu/text_bubble.json')
					.add('arrow', '../assets/menu/arrow.png')
					.on('progress', (loader: PIXI.Loader, resource: PIXI.LoaderResource) => this.loadProgressHandler(loader, resource))
					.load(() => this.gameLoaded());
	}

	private loadProgressHandler(loader: PIXI.Loader, resource: PIXI.LoaderResource){
		console.log(Math.round(loader.progress) + '%');
	}

	private gameLoaded(){
		this.overWorld.sortableChildren = true;
		this.app.stage.addChild(this.overWorld);
		this.overWorldSprite = new PIXI.Sprite(this.loader.resources.overworld.texture);
		this.overWorldSprite.x = 400 + (this.player.getX() * -48);
		this.overWorldSprite.y = 349 + (this.player.getY() * -48);
		this.overWorldSprite.zIndex = 0;
		this.overWorldSprite.scale.set(3, 3);

		const playerSprite: PIXI.Sprite = this.player.loadSprite(this.loader.resources.char_anim);

		this.grass_sprite = new PIXI.Sprite(this.loader.resources.tall_grass.textures?.init);
		this.grass_sprite.scale.set(3, 3);
		this.grass_sprite.zIndex = 0;

		this.grass_sprite2 = new SkipSprite((this.loader.resources.tall_grass.textures as PIXI.ITextureDictionary)['4']);
		this.grass_sprite2.x = 400;
		this.grass_sprite2.y = 348;
		this.grass_sprite2.zIndex = 3;
		this.grass_sprite2.scale.set(3, 3);
		this.grass_sprite.visible = this.grass_sprite2.visible = false;

		this.overWorld.addChild(this.overWorldSprite);
		this.overWorld.addChild(playerSprite);
		this.overWorld.addChild(this.grass_sprite);
		this.overWorld.addChild(this.grass_sprite2);
		this.overWorld.updateTransform();

		this.loaded = true;
		this.loading = false;
		console.log('GAME LOADED.');
		this.userInput();
		this.app.ticker.add((delta: number) => this.process(delta));
	}

	private userInput(){
		if(!this.loaded){
			return;
		}

		const left: Keypress = new Keypress('ArrowLeft', this.player);
		const right: Keypress = new Keypress('ArrowRight', this.player);
		const down: Keypress = new Keypress('ArrowDown', this.player);
		const up: Keypress = new Keypress('ArrowUp', this.player);

		left.press = (player: Player) => {
			player.vx = -25;
			player.vy = 0;
		};

		left.release = (player: Player) => {
			if(!right.isDownPressed()){
				player.vx = 0;
			}
		};

		right.press = (player: Player) => {
			player.vx = 25;
			player.vy = 0;
		};

		right.release = (player: Player) => {
			if(!left.isDownPressed()){
				player.vx = 0;
			}
		};

		up.press = (player: Player) => {
			player.vx = 0;
			player.vy = -25;
		};

		up.release = (player: Player) => {
			if(!down.isDownPressed()){
				player.vy = 0;
			}
		};

		down.press = (player: Player) => {
			player.vx = 0;
			player.vy = 25;
		};

		down.release = (player: Player) => {
			if(!up.isDownPressed()){
				player.vy = 0;
			}
		};

		const aKey: Keypress = new Keypress('a', this.player);
		aKey.release = (player: Player) => {
			player.handleAPress();
		};

		const bKey: Keypress = new Keypress('s', this.player);
		bKey.release = (player: Player) => {
			player.handleBPress();
		};

		const enter: Keypress = new Keypress('Enter', this.player);
		enter.release = (player: Player) => {
			player.handleEnterPress();
		};
	}

	process(delta: number){
		this.player.handleMove();
		SceneryEngine.getSceneryEngine().process();
	}

	move(amount: number, x: boolean | null = true){
		if(x == null){
			x = this.last_move_x;
		}else{
			this.last_move_x = x;
		}
		if(amount !== 0){
			this.last_move = amount;
		}else{
			amount = this.last_move;
		}

		const nextCoords: ICoordinates = {
			x: this.player.getX() + ((amount > 0 ? 1 : -1) * (x ? 1 : 0)),
			y: this.player.getY() + ((amount > 0 ? 1 : -1) * (x ? 0 : 1))
		};

		if(!Objects.canMove(this.player.getCoords(), nextCoords)){
			this.player.doneMoving();
			return;
		}

		this.moveObjects(amount, x);
		const correctOverworld: ICoordinates = { x: 400 + (nextCoords.x * -48), y: 349 + (nextCoords.y * -48) };
		if(correctOverworld.x === this.overWorldSprite.x && correctOverworld.y === this.overWorldSprite.y){
			this.player.setCoords(nextCoords);
			this.player.doneMoving();
			const tile: IObject | null = Objects.checkTileObject(nextCoords);
			if(tile != null){
				if(tile.hasEncounter){
					this.handleEncounter();
				}
			}
		}
	}

	addSprite(sprite: PIXI.DisplayObject){
		this.overWorld.addChild(sprite);
	}

	removeSprite(sprite: PIXI.DisplayObject){
		this.overWorld.removeChild(sprite);
	}

	moveObjects(amount: number, x: boolean = true){
		amount *= 100;
		for(const child of this.overWorld.children){
			if(child.name === 'PLAYER' || !child.visible){
				continue;
			}

			if(child instanceof SkipSprite){
				const sChild: SkipSprite = child as SkipSprite;
				sChild.skipMove = false;
				continue;
			}
			child.x *= 100;
			child.y *= 100;
			child.x -= amount * 48 * (x ? 1 : 0);
			child.y -= amount * 48 * (x ? 0 : 1);
			child.x = Math.round(child.x / 100);
			child.y = Math.round(child.y / 100);
		}
	}

	getPlayerCoords(): ICoordinates{
		return this.player.getCoords();
	}

	async handlePreGrassAnimation(amount: number, x: boolean = true){
		this.grass_sprite.x = 400 + ((amount > 0 ? 1 : -1) * 48 * (x ? 1 : 0));
		this.grass_sprite.y = 348 + ((amount > 0 ? 1 : -1) * 48 * (x ? 0 : 1));
		this.grass_sprite.visible = true;
		await Common.delay(20);
		this.grass_sprite.visible = false;
	}

	handleGrassAnimations(){
		this.grass_sprite2.visible = true;
		this.grass_sprite2.skipMove = true;
		this.animatedGrass = new PIXI.AnimatedSprite(this.loader.resources.tall_grass.spritesheet?.animations.anim);
		this.animatedGrass.loop = false;
		this.animatedGrass.x = 400;
		this.animatedGrass.y = 348;
		this.animatedGrass.zIndex = 3;
		this.animatedGrass.scale.set(3, 3);
		this.animatedGrass.animationSpeed = 10 / Game.FPS; // 4fps
		this.animatedGrass.onComplete = () => {
			if(this.animatedGrass != null){
				this.animatedGrass.destroy();
				Game.getGame().removeSprite(this.animatedGrass);
				this.animatedGrass = undefined;
			}
		};
		this.animatedGrass.play();
		this.overWorld.addChild(this.animatedGrass);
	}

	handleEncounter(){
		if(Common.random(1, 6) === 1){
			console.log('ENCOUNTER!!!');
		}
	}

	getResource(name: string): PIXI.LoaderResource | null{
		if(!(name in this.loader.resources)){
			return null;
		}
		return this.loader.resources[name];
	}
}

class SkipSprite extends PIXI.Sprite{
	public skipMove: boolean = false;
	constructor(texture?: PIXI.Texture){
		super(texture);
	}
}