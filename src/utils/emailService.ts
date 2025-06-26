import { createTransport } from "nodemailer";
import { Address, AttachmentLike } from "nodemailer/lib/mailer";
import { Readable } from "nodemailer/lib/xoauth2";

export const sendEmail = async (
  to: string | Address | (string | Address)[] | undefined,
  subject: string | undefined,
  html:
    | string
    | Buffer<ArrayBufferLike>
    | Readable
    | AttachmentLike
    | undefined,
) => {
  const transporter = createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"Cinema Booking" <no-reply@cinema.com',
    to,
    subject,
    html,
  });
};
