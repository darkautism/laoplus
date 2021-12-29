import { WaveClearResponse } from "../types";

export const speedHack = (res:WaveClearResponse) => {
    res.ClearRewardInfo.ItemRewardList = [];
    res.ClearRewardInfo.PCRewardList = [];
    return res;
}

export const fakeEnemy = (res:WaveClearResponse) => {
    // res.ClearRewardInfo.ItemRewardList = [];
    // res.ClearRewardInfo.PCRewardList = [];
    return res;
}