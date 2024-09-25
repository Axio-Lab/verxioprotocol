import ICampaign from "../interfaces/campaign.interface";
import Campaign from "../models/campaign.model";


export default class CampaignService {
    async create(campaign: Partial<ICampaign>) {
        return await Campaign.create(campaign);
    }

    async findOne(params: {}) {
        return await Campaign.findOne(params);
    }

    async find(params: {}) {
        return await Campaign.find(params);
    }
}