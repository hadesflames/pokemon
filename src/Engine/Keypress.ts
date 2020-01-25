import { Player } from './Player';

export default class Keypress{
	private value: string;
	private isDown: boolean = false;
	private isUp: boolean = true;
	public press: Function | undefined;
	public release: Function | undefined;
	private downHandler: Function;
	private upHandler: Function;
	private downListener: any;
	private upListener: any;
	private player: Player;

	constructor(value: string, player: Player){
		this.value = value;
		this.player = player;

		const key: Keypress = this;
		this.downHandler = (event: KeyboardEvent) => {
			if(event.key === key.value){
				if(key.isUp && key.press){
					key.press(key.player);
				}

				key.isDown = true;
				key.isUp = false;
				event.preventDefault();
			}
		};

		this.upHandler = (event: KeyboardEvent) => {
			if(event.key === key.value){
				if(key.isDown && key.release){
					key.release(key.player);
				}

				key.isDown = false;
				key.isUp = true;
				event.preventDefault();
			}
		};

		this.downListener = this.downHandler.bind(this);
		this.upListener = this.upHandler.bind(this);
		this.setupListeners();
	}

	private setupListeners(){
		window.addEventListener('keydown', this.downListener, false);
		window.addEventListener('keyup', this.upListener, false);
	}

	unsubscribe(){
		window.removeEventListener('keydown', this.downListener);
		window.removeEventListener('keyup', this.upListener);
	}

	isDownPressed(){
		return this.isDown === true;
	}
}