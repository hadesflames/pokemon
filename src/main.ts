import Game from './Game';

window.onload = () => {
	console.log('GAME LOADING.');
	Game.getGame().loadGame();
};