export default interface ICampaign {
    _id?: string;
    userId: string;
    campaignInfo: {
        title: string;
        start: string;
        end: string;
        description: string;
        banner: string;
    };
    action: {
        actionType: string;
        fields: {
            description?: string;
            url?: string;
            amount?: number;
            quantity?: number;
            address?: string;
            minAmount?: number;
            options?: string[];
        };
    };
    rewardInfo: {
        noOfPeople: number;
        xp: number;
        availableXP: number;
        type: string;
    };
    metaData: Record<string, any>;
}