import IParticipation from "../interfaces/participation.interface";
import Participation from "../models/participation.model";


export default class ParticipationService {
    async create(participation: Partial<IParticipation>) {
        return await Participation.create(participation);
    }

    async findOne(params: {}) {
        return await Participation.findOne(params);
    }

    async find(params: {}) {
        return await Participation.find(params);
    }
}