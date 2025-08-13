import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { MessagesSendResult } from 'mailgun.js/definitions';

import { ActionsReturnType } from '@/types/common';

const mailgunClientSingleton = () => {
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY is not defined');
  } 
  if (!process.env.MAILGUN_DOMAIN) {
    throw new Error('MAILGUN_DOMAIN is not defined');
  }
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
  });
};

declare const globalThis: {
  mailgunGlobal: ReturnType<typeof mailgunClientSingleton>;
} & typeof global;

const mailgunClient = globalThis.mailgunGlobal ?? mailgunClientSingleton();

export default mailgunClient;

if (process.env.NODE_ENV !== 'production') {globalThis.mailgunGlobal = mailgunClient;}

type EmailOptions = {
  to: string | string[]
  subject: string
  html: string
  from: string
}


export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'Merchkins Support'
}: EmailOptions): ActionsReturnType<MessagesSendResult> => {
  try {
    const result = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN as string, {
      from: `${from} <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html
    });
    return { success: true, message: 'Email sent successfully!', data: result };
  } catch (error) {
    return { success: false, errors: { message: (error as Error).message, name: (error as Error).name } };
  }
};
