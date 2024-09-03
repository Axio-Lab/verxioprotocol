import { Request, Response } from "express";

import XP from "../services/xp.service";
import Profile from "../services/profile.services";
import AuthRequest from "../interfaces/auth.interface";

const XPService = new XP();
const ProfileService = new Profile();


export default class XPController {

    async addXP(req: Request, res: Response) {
        try {
            const XP = await XPService.create(req.body.point, req.body.userId);

            const profile = await ProfileService.findOne({ _id: req.body.userId });

            if (profile) {
                profile.xp += XP.point;
                profile.save();
            }

            return res.status(201).send({
                success: true,
                message: "XP points transferred successfully",
                data: XP
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error transferring xp points: ${error.message}`
            });
        }
    }
}