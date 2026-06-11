export interface EmailProvider {
  sendInviteEmail(params: { to: string; householdName: string; inviteUrl: string }): Promise<void>;
}

export class ResendEmailProvider implements EmailProvider {
  async sendInviteEmail(_params: { to: string; householdName: string; inviteUrl: string }): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV EMAIL] Invite sent to ${_params.to}`);
      return;
    }
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "homeos@homeos.dev",
      to: _params.to,
      subject: `You've been invited to ${_params.householdName}`,
      html: `<p>Join <strong>${_params.householdName}</strong> on HomeOS:</p><p><a href="${_params.inviteUrl}">Accept Invitation</a></p>`,
    });
  }
}

export class NoopEmailProvider implements EmailProvider {
  async sendInviteEmail(_params: { to: string; householdName: string; inviteUrl: string }): Promise<void> {
    console.log(`[NOOP EMAIL] Invite to ${_params.to} for ${_params.householdName}`);
  }
}
