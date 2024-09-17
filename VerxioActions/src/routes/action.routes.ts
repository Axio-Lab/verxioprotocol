import { Router } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getProductAction,
    postProductAction,
    getBurnAction,
    postBurnAction,
    // getPollAction,
    // postPollAction,
    // getSubmitUrlAction,
    // postSubmitUrlAction,
    // getCompressTokenAction,
    // postCompressTokenAction,
    // getDecompressTokenAction,
    // postDecompressTokenAction
} = new ActionController();

// Existing routes
router.get("/p/:name", getProductAction);
router.options("/p/:name", getProductAction);
router.post("/p/:name", postProductAction);

router.get("/c/:title", getBurnAction);
router.options("/c/:title", getBurnAction);
router.post("/c/:title", postBurnAction);

// New routes for poll actions
// router.get("/poll/:title", getPollAction);
// router.options("/poll/:title", getPollAction);
// router.post("/poll/:campaignId/vote/:voteIndex", postPollAction);

// // New routes for URL submission
// router.get("/submit-url", getSubmitUrlAction);
// router.options("/submit-url", getSubmitUrlAction);
// router.post("/submit-url", postSubmitUrlAction);

// // New routes for token compression
// router.get("/compress-token", getCompressTokenAction);
// router.options("/compress-token", getCompressTokenAction);
// router.post("/compress-token", postCompressTokenAction);

// // New routes for token decompression
// router.get("/decompress-token", getDecompressTokenAction);
// router.options("/decompress-token", getDecompressTokenAction);
// router.post("/decompress-token", postDecompressTokenAction);

export default router;