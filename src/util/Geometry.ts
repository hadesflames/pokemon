import { IObject } from '../Engine/Objects';

export interface ICoordinates{
	x: number;
	y: number;
}

export class Rectangle{
	private topLeft: ICoordinates;
	private bottomRight: ICoordinates;

	constructor(x: number, y: number, w: number, h: number){
		this.topLeft = { x: x, y: y };
		this.bottomRight = { x: x + w, y: y + h };
	}

	static fromObject(obj: IObject){
		const width: number = obj.geometry.aabb.max.x - obj.geometry.aabb.min.x;
		const height: number = obj.geometry.aabb.max.y - obj.geometry.aabb.min.y;
		return new Rectangle(obj.geometry.aabb.min.x, obj.geometry.aabb.min.y, width, height);
	}

	intersects(rect: Rectangle): boolean{
		if((this.topLeft.x > rect.bottomRight.x) || (this.bottomRight.x < rect.topLeft.x) ||
			(this.topLeft.y > rect.bottomRight.y) || (this.bottomRight.y < rect.topLeft.y)){
			return false;
		}
		return true;
	}
}