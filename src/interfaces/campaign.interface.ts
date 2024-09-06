export default interface ICampaign {
    _id?: string;
    userId: string;
    campaignInfo: {
        title: string;
        start: string;
        end: string;
        timeZone: string;
        description: string;
        banner: string;
    };
    participantInfo: {
        status: string;
        participants?: [string];
        level: string;
        nationality?: string;
        ageRange?: string;
    };
    actions: [{
        type: string;
        options: {
            description: string;
            url: string;
            amount: string;
        }
    }];
    rewardInfo: {
        amount: number;
        noOfPeople: number;
        xp: number;
        availableXP: number;
        method: string;
        type: string;
        res?: object;
    };
    metaData: {};
    isPaused: boolean;
}