import { Reclaim } from '@reclaimprotocol/js-sdk';
import express from 'express'; // Import express
import { v4 as uuidv4 } from 'uuid'; // Import uuid for session ID generation

// Link to the reclaim backend docs integration: https://docs.reclaimprotocol.org/js/backend
// Link to the reclaim methods documentation: https://docs.reclaimprotocol.org/sdk-methods

const router = express.Router(); // Create a router

// New endpoint for verification
router.post('/verify-user', async (req, res) => {
    const userId = req.body.userId; // Get userId from request body
    const sessionId = uuidv4(); // Generate a new session ID

    const APP_ID = "0xc0A6468c80110F7762A3de8b71A77c2a09EC0129";
    const APP_SECRET = "0xca795119790f8818430cda2753b91edc1a3824de222d8c74848a6cab63edffc9";
    const PROVIDERS = {
        "github_username": "6d3f6753-7ee6-49ee-a545-62f1b1822ae5",
        "gmail": "f9f383fd-32d9-4c54-942f-5e9fda349762",
        "yc_founder_details": "0bc34db6-bae2-48ca-b864-9f1094defedc"
    }

    const reclaimClient = new Reclaim.ProofRequest(APP_ID, sessionId);
    await reclaimClient.buildProofRequest(PROVIDERS);
    reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));

    const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
    console.log("requestUrl", requestUrl);
    console.log("statusUrl", statusUrl);

    // Send the request and status URLs back to the client
    res.json({ requestUrl, statusUrl });

    await reclaimClient.startSession({
        onSuccessCallback: proof => {
          console.log('Verification success', proof)
          // Your business logic here
        },
        onFailureCallback: error => {
          console.error('Verification failed', error)
          // Your business logic here to handle the error
        }
      })

    // Polling logic can be implemented on the client-side
});



//   const getVerificationReq = async () => {
    
//     const APP_ID = "0xc0A6468c80110F7762A3de8b71A77c2a09EC0129";
//     const APP_SECRET = "0xca795119790f8818430cda2753b91edc1a3824de222d8c74848a6cab63edffc9";
//     const PROVIDERS = {
//         "github_username": "6d3f6753-7ee6-49ee-a545-62f1b1822ae5",
//         "gmail": "f9f383fd-32d9-4c54-942f-5e9fda349762",
//         "yc_founder_details": "0bc34db6-bae2-48ca-b864-9f1094defedc"
//     }
//     const reclaimClient = new Reclaim.ProofRequest(APP_ID);

//     await reclaimClient.buildProofRequest(PROVIDERS);
  
//     reclaimClient.setSignature(
// 	await reclaimClient.generateSignature(APP_SECRET)
//     )

//     const { requestUrl, statusUrl } =
//       await reclaimClient.createVerificationRequest()

//     console.log("requestUrl", requestUrl);
//     console.log("statusUrl", statusUrl);

//     await reclaimClient.startSession({
//       onSuccessCallback: proof => {
//         console.log('Verification success', proof)
//         // Your business logic here
//       },
//       onFailureCallback: error => {
//         console.error('Verification failed', error)
//         // Your business logic here to handle the error
//       }
//     })
// };


// call when user clicks on a button
// onClick={getVerificationReq}
