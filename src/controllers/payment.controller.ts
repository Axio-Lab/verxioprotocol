import { Request, Response } from "express";
import PaymentService from "../services/payment.service";
import ProductService from "../services/product.servicee";
import PayloadService from "../services/payload.service";
import sendEmail from "../utils/sendmail.util";
import underdog from "../configs/underdog.config";
const { getProduct } = new ProductService();
const { createCandypaySession } = new PaymentService();
const { create, findOne, update } = new PayloadService();

export default class PaymentController {

    async createPayment(req: Request, res: Response) {
        try {
            const productId = req.params.productId;
            // const foundPayload = await findOne({ "paymentInfo.produtId": productId })
            // if (foundPayload) {
            //     return res.status(200)
            //         .send({
            //             success: true,
            //             message: "Payment session url returned successfully1",
            //             payment_url: foundPayload.paymentInfo!.payment_url!
            //         })
            // }

            const product = await getProduct(productId);
            if (!product) {
                return res.status(404)
                    .send({
                        success: false,
                        message: "Invalid productId"
                    })
            }
            const { session_id, order_id, payment_url } = await createCandypaySession(product!);
            await create({ paymentInfo: { productId, session_id, order_id, payment_url } });

            return res.status(200)
                .send({
                    success: true,
                    message: "Payment session url returned successfully",
                    payment_url
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while creating a candy pay session\nError: ${error.message}`
                })
        }
    }

    async sendPaymentMail(req: Request, res: Response) {
        try {
            const payload = req.body.payload;
            if (!payload) {
                return res.status(403)
                    .send({
                        success: false,
                        message: "Please provide needed payload"
                    })
            }

            if (payload.event !== "transaction.successful") {
                const foundPayload = await findOne({ "paymentInfo.session_id": payload.session_id })

                //send mail to the buyer
                await sendEmail({
                    from: `Verxio <${process.env.MAIL_USER}>`,
                    to: payload.customer_email,
                    sender: "Verxio",
                    subject: 'Payment Unsuccessful for Your Recent Purchase',
                    html: `
                        <p>We regret to inform you that your payment for the purchase of ${payload.metadata.productName} was unsuccessful.</p>
                
                        <p>We suggest you try again or use <a href="${foundPayload?.paymentInfo.payment_url}">this</a> payment url to make payment: ${foundPayload?.paymentInfo.payment_url}</p>
                
                        <p>If you continue to experience issues, please do not hesitate to contact us.</p>
                
                        <p>We apologize for any inconvenience this may have caused and appreciate your understanding.</p>
                
                        <p>Best regards,<br>
                    Verxio</p>
                    `
                })

                return res.status(400)
                    .send({
                        success: false,
                        message: "Payment not successful"
                    })
            }

            const product = await getProduct(payload.metadata.productId);
            product.sales += 1;
            product.revenue = product.revenue + payload.payment_amount;
            await product.save();

            await update({ "paymentInfo.productId": payload.metadata.produtId }, { payload: payload });
            const rounded = parseFloat(payload.payment_amount.toFixed(2));

            //send mail to seller
            await sendEmail({
                from: `Verxio <${process.env.MAIL_USER}>`,
                to: payload.metadata.name,
                sender: "Verxio",
                subject: 'Congratulations on Your Sale!',
                html: `          
                    <p>You made a sale!</p>
            
                    <p>$${rounded} has been deposited into your wallet (${payload.metadata.wallet_address}) for the purchase of ${payload.metadata.productName} product.</p>
            
                    <p>Keep up the great work and continue to provide excellent products and services.</p>
            
                    <p>Best regards,<br>
                    Verxio</p>
                `
            })

            const nftPayload = {
                name: payload.metadata.pop.name,
                image: payload.metadata.pop.imageUrl,
                receiverAddress: payload.customer
            };
            const collectionId = payload.metadata.pop.collectionId;

            //create the nft for the user
            const { data: mintedNFT } = await underdog.post(`/v2/projects/n/${collectionId}/nfts`, nftPayload);
            const { data: nftClaimLink } = await underdog.get(`/v2/projects/n/${collectionId}/nfts/${mintedNFT.id}/claim`);

            //send mail to buyer
            if (payload.token === "bonk") {

                await sendEmail({
                    from: `Verxio <${process.env.MAIL_USER}>`,
                    to: payload.customer_email,
                    sender: "Verxio",
                    subject: 'Your Purchase Confirmation and Reward Details',
                    html: `
                    <p>Thank you for your purchase!</p>
            
                    <p>You've successfully purchased ${payload.metadata.productName}. You can access the product <a href="${payload.metadata.product}">here</a>.</p>
            
                    <p>Click <a href="${nftClaimLink.link}">here</a> to claim your proof of purchase NFT.</p>
                    
                    <p>As a token of our appreciation, the BONK foundation has a surprise for you🥳</p>

                    <p>Check your wallet to see the BONK cashback you have received as a reward for your purchase😎</p>
            
                    <p>We value your support and look forward to serving you again.</p>
            
                    <p>Best regards,<br>
                    Verxio</p>
                `
                })

            } else {
                await sendEmail({
                    from: `Verxio <${process.env.MAIL_USER}>`,
                    to: payload.customer_email,
                    sender: "Verxio",
                    subject: 'Your Purchase Confirmation',
                    html: `            
                    <p>Thank you for your purchase!</p>
            
                    <p>You've successfully purchased ${payload.metadata.productName}. You can access the product <a href="${payload.metadata.product}">here</a>.</p>
                        
                    <p>Click <a href="${nftClaimLink.link}">here</a> to claim your proof of purchase NFT.</p>

                    <p>We value your support and look forward to serving you again.</p>
            
                    <p>Best regards,<br>
                    Verxio</p>
                `
                })
            }

            return res.status(200)
                .send({
                    success: true,
                    message: "Emails sent and nft minted successfully",
                    mintedNFT
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while sending mail and minting NFT: ${error.message}`
                })
        }
    }
}