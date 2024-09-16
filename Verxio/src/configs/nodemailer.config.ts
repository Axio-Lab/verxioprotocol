import { configDotenv } from "dotenv";
import nodemailer from "nodemailer";

if (process.env.NODE_ENV !== 'production') configDotenv();

//Transporter Creation
export default nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    },
});