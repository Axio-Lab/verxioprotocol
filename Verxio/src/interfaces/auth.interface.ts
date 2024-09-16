import { Request } from "express";
import IUser from "./profile.interfaces";

export default interface AuthRequest extends Request {
    user: IUser;
}