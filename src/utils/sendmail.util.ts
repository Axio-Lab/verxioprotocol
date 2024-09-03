import transporter from "../configs/nodemailer.config";

export default async function sendEmail(mailOptions: {}) {  
    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        throw new Error(`Error sending email: ${error}`);
    }
}