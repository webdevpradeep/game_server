import nodemailer from 'nodemailer';

// Looking to send emails in production? Check out our Email API/SMTP product!
const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOSt,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, body) => {
  await transport.sendMail({
    from: '"game" <game@game.com>',
    to,
    subject,
    html: body, // html body
  });
};

export default sendEmail;
