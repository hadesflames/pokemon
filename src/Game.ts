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

		const left = new Keypress('ArrowLeft', this.player);
		const right = new Keypress('ArrowRight', this.player);
		const down = new Keypress('ArrowDown', this.player);
		const up = new Keypress('ArrowUp', this.player);

		left.press = (player: Player) => {
			player.vx = -3;
			player.vy = 0;
		};

		left.release = (player: Player) => {
			if(!right.isDownPressed() && player.vy === 0){
				player.vx = 0;
			}
		};

		right.press = (player: Player) => {
			player.vx = 3;
			player.vy = 0;
		};

		right.release = (player: Player) => {
			if(!left.isDownPressed() && player.vy === 0){
				player.vx = 0;
			}
		};

		up.press = (player: Player) => {
			player.vx = 0;
			player.vy = -3;
		};

		up.release = (player: Player) => {
			if(!down.isDownPressed() && player.vx === 0){
				player.vy = 0;
			}
		};

		down.press = (player: Player) => {
			player.vx = 0;
			player.vy = 3;
		};

		down.release = (player: Player) => {
			if(!up.isDownPressed() && player.vx === 0){
				player.vy = 0;
			}
		};
	}

	private keyPress(e: KeyboardEvent){
		if(e.keyCode === 97){
			this.player.handleAPress();
		}else if(e.keyCode === 115){
			this.player.handleBPress();
		}else if(e.keyCode === 13){
			this.player.handleEnterPress();
		}
	}

	process(delta: number){
		this.player.handleMove();
		SceneryEngine.getSceneryEngine().process();
	}

	move(amount: number, x: boolean = true){
		const nextCoords: ICoordinates = { x: this.player.getX() + (amount * (x ? 1 : 0)), y: this.player.getY() + (amount * (x ? 0 : 1)) };

		if(!Objects.canMove(this.player.getCoords(), nextCoords)){
			return;
		}

		if(this.animatedGrass != null){
			this.animatedGrass.destroy();
			this.overWorld.removeChild(this.animatedGrass);
			this.animatedGrass = undefined;
		}
		if(Objects.hasGrass(nextCoords)){
			this.handlePreGrassAnimation(amount, x);
		}else{
			this.grass_sprite2.visible = false;
		}

		this.moveObjects(amount, x);
		this.player.setCoords(nextCoords);

		const tile: IObject | null = Objects.checkTileObject(nextCoords);
		if(tile != null){
			if(tile.isGrass){
				this.handleGrassAnimations();
			}

			if(tile.hasEncounter){
				this.handleEncounter();
			}
		}
		console.log(nextCoords);
	}

	addSprite(sprite: PIXI.DisplayObject){
		this.overWorld.addChild(sprite);
	}

	removeSprite(sprite: PIXI.DisplayObject){
		this.overWorld.removeChild(sprite);
	}

	moveObjects(amount: number, x: boolean = true){
		for(const child of this.overWorld.children){
			if(child.name === 'PLAYER' || !child.visible){
				continue;
			}

			if(child instanceof SkipSprite){
				const sChild: SkipSprite = child as SkipSprite;
				sChild.skipMove = false;
				continue;
			}
			child.x -= amount * 48 * (x ? 1 : 0);
			child.y -= amount * 48 * (x ? 0 : 1);
		}
	}

	getPlayerCoords(): ICoordinates{
		return this.player.getCoords();
	}

	async handlePreGrassAnimation(amount: number, x: boolean = true){
		this.grass_sprite.x = 400 + (amount * 48 * (x ? 1 : 0));
		this.grass_sprite.y = 348 + (amount * 48 * (x ? 0 : 1));
		this.grass_sprite.visible = true;
		await Common.delay(75);
		this.grass_sprite.visible = false;
	}

	async handleGrassAnimations(){
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