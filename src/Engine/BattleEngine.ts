import Pokemon from '../Pokemon';
import Move from '../Move';
import Common from '../util/Common';

export default class BattleEngine{
	private p1: Pokemon;
	private p2: Pokemon;
	constructor(p1: Pokemon, p2: Pokemon){
		this.p1 = p1;
		this.p2 = p2;
	}

	attackP1(move: Move){
		this.attack(this.p2, this.p1, move);
	}

	attackP2(move: Move){
		this.attack(this.p1, this.p2, move);
	}

	attack(attacker: Pokemon, defender: Pokemon, move: Move){
		const targets: number = 1;
		const weather: number = 1; // TODO: Implement weather
		const critical: number = move.calculateCritical();
		const random: number = (Common.random(85, 100) / 100);
		const STAB: number = attacker.isStab(move) ? 1.5 : 1;
		const type_multiplier: number = move.getType().multiplier(defender.getType()) * move.getType().multiplier(defender.getType2());
		const burn: number = attacker.isBurned() ? 0.5 : 1;
		const base_dmg: number = this.baseDmg(attacker.getLevel(), move.getPower(), attacker.getPower(move), defender.getDefense(move));
		const modifier: number = targets * weather * critical * random * STAB * type_multiplier * burn;

		defender.takeDamage(base_dmg * modifier, critical > 1, type_multiplier);
	}

	/**
	 * Calculates the base damage (damage prior to modifiers) of the attack being done using the standard pokemon damage formula.
	 * @param level The level of the attacking pokemon.
	 * @param power The base power of the move being used.
	 * @param attack The attack/specattack of the attacking pokemon.
	 * @param defense The defense/specdefense of the pokemon being attacked.
	 */
	baseDmg(level: number, power: number, attack: number, defense: number): number{
		return Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * power * attack / defense) / 50) + 2;
	}
}