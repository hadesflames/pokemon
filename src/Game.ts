import * as PIXI from 'pixi.js';
import { Player, PlayerFaceDirection, ICoordinates } from './Engine/Player';
import Common from './Common';
import Collision from './Engine/Collision';

export default class Game{
	private static GAME: Game;

	private loaded: boolean = false;
	private loading: boolean = false;
	private app: PIXI.Application;
	private loader: PIXI.Loader;
	private player: Player;
	private overWorld: PIXI.Sprite;

	private constructor(){
		this.app = new PIXI.Application({width: 800, height: 600});
		this.loader = new PIXI.Loader();
		this.player = new Player(66, 268);
		this.overWorld = new PIXI.Sprite();
		document.body.appendChild(this.app.view);
	}

	static getGame(){
		if(Game.GAME == null){
			Game.GAME = new Game();
		}

		return Game.GAME;
	}

	loadGame(){
		if(this.loaded || this.loading){
			return;
		}

		this.loading = true;
		Collision.loadObjects();
		this.loader.add('overworld', '../assets/world.png')
					.add('char', '../assets/char.png')
					.on('progress', (loader: PIXI.Loader, resource: PIXI.LoaderResource) => this.loadProgressHandler(loader, resource))
					.load(() => this.gameLoaded());
	}

	private loadProgressHandler(loader: PIXI.Loader, resource: PIXI.LoaderResource){
		console.log(Math.round(loader.progress) + '%');
	}

	private gameLoaded(){
		this.overWorld = new PIXI.Sprite(this.loader.resources['overworld'].texture);
		this.overWorld.x = 400 + (this.player.getX() * -48);
		this.overWorld.y = 349 + (this.player.getY() * -48);
		console.log(this.overWorld.x, this.overWorld.y);
		this.overWorld.scale.set(3, 3);
		const playerSprite: PIXI.Sprite = this.player.loadSprite(this.loader.resources['char'].texture);
		this.app.stage.addChild(this.overWorld);
		this.app.stage.addChild(playerSprite);
		this.loaded = true;
		this.loading = false;
		console.log('GAME LOADED.');
		this.userInput();
	}

	private userInput(){
		if(!this.loaded){
			return;
		}

		document.addEventListener('keypress', (e: KeyboardEvent) => this.keyPress(e));

		document.addEventListener('keydown', (e: KeyboardEvent) => this.keyDown(e));

		document.addEventListener('keyup', (e: KeyboardEvent) => this.keyUp(e));
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

	private keyDown(e: KeyboardEvent){
		// Movement
		if(e.keyCode >= 37 && e.keyCode <= 40){
			switch(e.keyCode){
				case PlayerFaceDirection.LEFT:
					this.player.move(PlayerFaceDirection.LEFT);
					break;
				case PlayerFaceDirection.UP:
					this.player.move(PlayerFaceDirection.UP);
					break;
				case PlayerFaceDirection.RIGHT:
					this.player.move(PlayerFaceDirection.RIGHT);
					break;
				case PlayerFaceDirection.DOWN:
					this.player.move(PlayerFaceDirection.DOWN);
					break;
			}
		}
	}

	private keyUp(e: KeyboardEvent){
		// Movement
		if(e.keyCode >= 37 && e.keyCode <= 40){
			this.player.stopMovement();
		}
	}

	async move(amount: number, x: boolean = true): Promise<ICoordinates>{
		const nextCoords: ICoordinates = {x: this.player.getX(), y: this.player.getY()};
		if(x){
			nextCoords.x += amount;
		}else{
			nextCoords.y += amount;
		}

		if(!Collision.canMove(this.player.getCoords(), nextCoords)){
			await Common.delay(150);
			return this.player.getCoords();
		}

		if(x){
			this.overWorld.x -= amount * 48;
		}else{
			this.overWorld.y -= amount * 48;
		}

		console.log(nextCoords);
		// await Common.delay(150);
		return nextCoords;
	}
}