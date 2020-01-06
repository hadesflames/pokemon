import objectData from '../../data/objects.json';
import SpatialManager from 'spatial-hashmap';
import { ICoordinates } from './Player';

export default class Objects{
	private static MAP = new SpatialManager(407, 399, 25);
	static canMove(current: ICoordinates, next: ICoordinates): boolean{
		const objects: Set<unknown> = Objects.getNearbyObjects(current);

		for(const val of objects){
			const object: IObject = val as IObject;
			if((object.geometry.aabb.min.x <= next.x && object.geometry.aabb.max.x >= next.x) &&
				(object.geometry.aabb.min.y <= next.y && object.geometry.aabb.max.y >= next.y) && !object.canMove){
				return false;
			}
		}
		return true;
	}

	static hasGrass(coords: ICoordinates): boolean{
		const objects: Set<unknown> = Objects.getNearbyObjects(coords);

		for(const val of objects){
			const object: IObject = val as IObject;
			if((object.geometry.aabb.min.x <= coords.x && object.geometry.aabb.max.x >= coords.x) &&
				(object.geometry.aabb.min.y <= coords.y && object.geometry.aabb.max.y >= coords.y) && object.isGrass){
				return true;
			}
		}
		return false;
	}

	static checkForMessage(pos: ICoordinates): string[] | null{
		const objects: Set<unknown> = Objects.getNearbyObjects(pos);

		for(const val of objects){
			const object: IObject = val as IObject;
			if(object.msgLocation == null || object.msg == null){
				continue;
			}

			if(object.msgLocation.x === pos.x && object.msgLocation.y === pos.y){
				return object.msg;
			}
		}

		return null;
	}

	static loadObjects(){
		objectData.forEach((val: IObject) => {
			Objects.MAP.registerObject(val, val.geometry);
		});
	}

	static checkTileObject(coords: ICoordinates): IObject | null{
		const objects: Set<unknown> = Objects.getNearbyObjects(coords);

		for(const val of objects){
			const object: IObject = val as IObject;
			if((object.geometry.aabb.min.x <= coords.x && object.geometry.aabb.max.x >= coords.x) &&
				(object.geometry.aabb.min.y <= coords.y && object.geometry.aabb.max.y >= coords.y) &&
				(object.hasEncounter || object.isGrass || object.isWater)){
				return object;
			}
		}

		return null;
	}

	static getNearbyObjects(coords: ICoordinates): Set<unknown>{
		return Objects.MAP.getNearby({
			pos: {
				x: coords.x,
				y: coords.y
			},
			aabb: {
				min: {
					x: coords.x,
					y: coords.y
				},
				max: {
					x: coords.x,
					y: coords.y
				}
			}
		});
	}
}

export interface IObject{
	geometry: IGeometry;
	door: ICoordinates | null;
	msg: string[] | null;
	msgLocation: ICoordinates | null;
	canMove: boolean;
	hasEncounter: boolean;
	isGrass: boolean;
	isWater: boolean;
}

interface IGeometry{
	pos: {
		x: number,
		y: number
	};
	aabb: {
		min: {
			x: number,
			y: number
		},
		max: {
			x: number,
			y: number
		}
	};
}