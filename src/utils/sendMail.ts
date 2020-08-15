import nodemailer from 'nodemailer';

interface SendEmail {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({
  email,
  subject,
  text,
  html,
}: SendEmail): Promise<void> {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: email, // to.join(),
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  });

  console.log('⚠️  Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('⚠️  Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
