import nodemailer from 'nodemailer';

var transport = nodemailer.createTransport({
  host: process.env.EAMIL_HOST,
  port: process.env.EAMIL_PORT,
  auth: {
    user: process.env.EAMIL_USERNAME,
    pass: process.env.EAMIL_PASSWORD,
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
