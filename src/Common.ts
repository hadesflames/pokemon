export default class Common{
	/**
	 * Generates a random number between x and y inclusive.
	 * @param x
	 * @param y
	 */
	static random(x: number, y: number){
		const val: number = Math.random() * (y - (x >= 1 ? (x - 1) : 0));
		if(x === 0){
			return Math.round(val) + x;
		}
		return Math.floor(val) + x;
	}

	static delay(ms: number){
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}