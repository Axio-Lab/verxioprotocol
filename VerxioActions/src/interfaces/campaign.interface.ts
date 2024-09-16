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
    // participantInfo: {
    //     status: string;
    //     participants?: [string];
    //     level: string;
    //     nationality?: string;
    //     ageRange?: string;
    // };
    actions: {
        campaignType: string;
        actionType: string;
        action: {
            description: string;
            url: string;
            amount: number;
        }
    };
    rewardInfo: {
        // amount?: number;
        noOfPeople: number;
        xp: number;
        availableXP: number;
        // method: string;
        type: string;
        // res?: object;
    };
    metaData: {};
    isPaused: boolean;
}