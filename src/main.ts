import Game from './Game';

window.onload = () => {
	document.getElementById('play')?.addEventListener('click', () => {
		document.getElementById('play')?.remove();
		console.log('GAME LOADING.');
		Game.getGame().loadGame();
	});
};