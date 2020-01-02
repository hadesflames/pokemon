export default class Common{
	/**
	 * Generates a random number between min and max inclusive.
	 * @param x
	 * @param y
	 */
	static random(min: number, max: number){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static delay(ms: number){
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}