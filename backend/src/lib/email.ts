const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

function requireEmailEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
  const apiKey = requireEmailEnv('RESEND_API_KEY', RESEND_API_KEY);
  const from = requireEmailEnv('EMAIL_FROM', EMAIL_FROM);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: 'Verify your DSA a Day account',
      html: `
        <p>Welcome to DSA a Day.</p>
        <p>Please verify your email address to activate your account:</p>
        <p><a href="${verificationUrl}">Verify email</a></p>
        <p>This link expires in 24 hours.</p>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send verification email: ${errorText}`);
  }
}
