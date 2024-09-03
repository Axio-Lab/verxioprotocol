import XP from "../models/xp.model";


export default class XPService {
    async create(point: number, userId: string) {
        const time = new Date();
        return await XP.create({
            point,
            userId,
            time
        });
    }
}
