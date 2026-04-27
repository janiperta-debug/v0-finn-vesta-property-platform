import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, organization, propertyCount, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nimi, sähköposti ja viesti ovat pakollisia kenttiä' },
        { status: 400 }
      )
    }

    // Send email to info@janope.fi
    const { data, error } = await resend.emails.send({
      from: 'FinnVesta <noreply@finnvesta.fi>',
      to: ['info@janope.fi'],
      replyTo: email,
      subject: `Yhteydenotto: ${name}${organization ? ` (${organization})` : ''}`,
      html: `
        <h2>Uusi yhteydenotto FinnVesta-sivustolta</h2>
        
        <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Nimi:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Sähköposti:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          ${organization ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Organisaatio:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${organization}</td>
          </tr>
          ` : ''}
          ${propertyCount ? `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Kiinteistöjen määrä:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${propertyCount}</td>
          </tr>
          ` : ''}
        </table>
        
        <h3 style="margin-top: 24px;">Viesti:</h3>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 16px; border-radius: 8px;">${message}</p>
        
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <p style="color: #666; font-size: 12px;">Tämä viesti lähetettiin FinnVesta-sivuston yhteydenottolomakkeelta.</p>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Viestin lähetys epäonnistui. Yritä uudelleen.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Palvelinvirhe. Yritä uudelleen myöhemmin.' },
      { status: 500 }
    )
  }
}
