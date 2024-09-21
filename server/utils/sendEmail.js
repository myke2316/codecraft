import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service:'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });  
 
  const mailOptions = {
    from: "CodeCraft <codecraft.elearning@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  
  await transporter.sendMail(mailOptions);
};



export default sendEmail;
