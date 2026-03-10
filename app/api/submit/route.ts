import { NextRequest, NextResponse } from 'next/server'
import { insertResponse } from '@/lib/db'

async function sendAlert(data: Record<string, unknown>) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return // silently skip if not configured

  const name      = data.fullName   || 'Unknown'
  const email     = data.email      || '—'
  const unit      = data.unit       || '—'
  const station   = data.dutyStation === 'Nairobi Hub (specify below)'
                      ? data.countryOffice
                      : data.dutyStation || '—'
  const kpis      = (data.kpisSelected as string[] || []).slice(0, 5).join(', ') || '—'
  const challenge = data.biggestChallenge || '—'
  const wishlist  = data.openWishlist || '—'
  const importance = data.importanceRating ? `${data.importanceRating}/5` : '—'
  const ts        = new Date().toUTCString()

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#EEF6FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#EEF6FC;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #B8D4E8;border-radius:6px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="background:#005A9C;padding:18px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="color:#B3DCEF;font-size:11px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">WHO AFRO · Emergencies Programme</span><br/>
                  <span style="color:#ffffff;font-size:18px;font-weight:700;margin-top:4px;display:block;">OSL PULSE · New Survey Submission</span>
                </td>
                <td align="right" style="color:rgba(255,255,255,0.4);font-size:10px;font-family:monospace;vertical-align:top;">${ts}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alert band -->
        <tr>
          <td style="background:#009ADE;padding:10px 28px;">
            <span style="color:#ffffff;font-size:13px;font-weight:700;">🔔 &nbsp;${name} just completed the system mapping survey</span>
          </td>
        </tr>

        <!-- Identity block -->
        <tr>
          <td style="padding:24px 28px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #B8D4E8;border-radius:4px;overflow:hidden;">
              <tr style="background:#E5F5FD;">
                <td style="padding:10px 14px;font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#005A9C;width:140px;">Name</td>
                <td style="padding:10px 14px;font-size:13px;color:#0D1B2A;font-weight:700;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#005A9C;">Email</td>
                <td style="padding:10px 14px;font-size:13px;color:#0D1B2A;"><a href="mailto:${email}" style="color:#009ADE;">${email}</a></td>
              </tr>
              <tr style="background:#E5F5FD;">
                <td style="padding:10px 14px;font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#005A9C;">Unit</td>
                <td style="padding:10px 14px;font-size:13px;color:#0D1B2A;">${unit}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#005A9C;">Station</td>
                <td style="padding:10px 14px;font-size:13px;color:#0D1B2A;">${station}</td>
              </tr>
              <tr style="background:#E5F5FD;">
                <td style="padding:10px 14px;font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#005A9C;">Importance</td>
                <td style="padding:10px 14px;font-size:13px;color:#0D1B2A;font-weight:700;">${importance}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- KPIs -->
        <tr>
          <td style="padding:20px 28px 0;">
            <div style="font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#009ADE;margin-bottom:8px;">Top KPIs Selected</div>
            <div style="background:#E5F5FD;border:1px solid #B8D4E8;border-radius:3px;padding:12px 14px;font-size:13px;color:#0D1B2A;line-height:1.6;">${kpis}</div>
          </td>
        </tr>

        <!-- Biggest Challenge -->
        <tr>
          <td style="padding:16px 28px 0;">
            <div style="font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#009ADE;margin-bottom:8px;">Biggest Challenge</div>
            <div style="background:#FFF8E1;border:1px solid #FDE68A;border-radius:3px;padding:12px 14px;font-size:13px;color:#0D1B2A;line-height:1.6;">${challenge}</div>
          </td>
        </tr>

        <!-- Open Wishlist -->
        <tr>
          <td style="padding:16px 28px 0;">
            <div style="font-size:10px;font-family:monospace;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#009ADE;margin-bottom:8px;">Open Wishlist (Q30)</div>
            <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:3px;padding:12px 14px;font-size:13px;color:#0D1B2A;line-height:1.6;">${wishlist}</div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:24px 28px;">
            <a href="https://osl-pulse.vercel.app/api/responses" 
               style="display:inline-block;background:#005A9C;color:#ffffff;font-family:monospace;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:12px 24px;border-radius:3px;text-decoration:none;">
              → View All Responses in DB
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#005A9C;padding:14px 28px;text-align:center;">
            <span style="color:rgba(255,255,255,0.4);font-family:monospace;font-size:10px;letter-spacing:1px;">WHO AFRO · OSL PULSE · FORM-OSL-SYS-001 · 2026</span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:    'OSL PULSE <onboarding@resend.dev>',
      to:      ['akanimo1@gmail.com'],         // change to your real email
      subject: `🔔 OSL PULSE — ${name} (${unit}) just submitted`,
      html,
    }),
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

    // Save to DB first — always
    await insertResponse({ ...body, ip })

    // Fire email alert — non-blocking, failure won't break submission
    sendAlert(body).catch(e => console.error('[email alert]', e))

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[submit]', e)
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}
