import express, {Request, Response} from "express";
const router = express.Router()

router.get("/", async(req: Request, res: Response) => {
    res.redirect("https://documenter.getpostman.com/view/22416364/2sA3kaCeiH")
})

export default router