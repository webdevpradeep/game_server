import nodemailer from 'nodemailer';

var transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, body) => {
  const info = await transport.sendMail({
    from: 'Apple Server <a@apple.com>',
    to,
    subject,
    html: body,
  });
};

export { sendEmail };
