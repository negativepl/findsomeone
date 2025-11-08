import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schema
const contactSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  subject: z.string().min(3, 'Temat musi mieć minimum 3 znaki').max(200, 'Temat może mieć maksymalnie 200 znaków'),
  message: z.string().min(10, 'Wiadomość musi mieć minimum 10 znaków').max(5000, 'Wiadomość może mieć maksymalnie 5000 znaków'),
  category: z.enum(['general', 'support', 'moderation', 'complaints', 'gdpr']).default('general'), // general = kontakt@, support = pomoc@, moderation = moderacja@, complaints = reklamacje@, gdpr = rodo@
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = contactSchema.parse(body)
    const { email, subject, message, category } = validatedData

    // Determine recipient based on category
    const toEmail =
      category === 'support' ? 'pomoc@findsomeone.app' :
      category === 'moderation' ? 'moderacja@findsomeone.app' :
      category === 'complaints' ? 'reklamacje@findsomeone.app' :
      category === 'gdpr' ? 'rodo@findsomeone.app' :
      'kontakt@findsomeone.app'
    const fromEmail =
      category === 'support' ? 'pomoc@findsomeone.app' :
      category === 'moderation' ? 'moderacja@findsomeone.app' :
      category === 'complaints' ? 'reklamacje@findsomeone.app' :
      category === 'gdpr' ? 'rodo@findsomeone.app' :
      'kontakt@findsomeone.app'

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email, // User's email for easy reply
      subject: `[FindSomeone] ${subject}`,
      html: `
<!DOCTYPE html>
<html lang="pl" style="margin: 0; padding: 0; height: 100%;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nowa wiadomość kontaktowa</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #100908 !important;
            line-height: 1.6;
            width: 100%;
            height: 100%;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #100908;
            padding: 40px 20px;
        }
        .email-content {
            background-color: #1f1211;
            border-radius: 24px;
            padding: 48px 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
        .logo {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo-container {
            display: inline-block;
            text-decoration: none;
        }
        .logo-svg {
            width: 48px;
            height: 48px;
            vertical-align: middle;
            margin-right: 12px;
        }
        .logo-brand {
            font-size: 24px;
            font-weight: 700;
            color: #f9f0ee;
            line-height: 48px;
            margin: 0;
            font-family: "Lora", Georgia, serif;
            vertical-align: middle;
            display: inline-block;
        }
        h1 {
            color: #f9f0ee;
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 16px 0;
            text-align: center;
        }
        .info-box {
            background-color: #2a201e;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }
        .info-row {
            margin: 12px 0;
            color: rgba(249, 240, 238, 0.7);
            font-size: 15px;
        }
        .info-label {
            color: #f27361;
            font-weight: 600;
            margin-right: 8px;
        }
        .message-box {
            background-color: #100908;
            border-radius: 12px;
            padding: 20px;
            margin: 24px 0;
        }
        .message-box h3 {
            color: #f9f0ee;
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 16px 0;
        }
        .message-content {
            color: rgba(249, 240, 238, 0.85);
            font-size: 15px;
            line-height: 1.7;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .divider {
            height: 1px;
            background-color: #2a201e;
            margin: 32px 0;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
        }
        .footer p {
            font-size: 14px;
            color: rgba(249, 240, 238, 0.4);
            margin: 0 0 12px 0;
        }
        .footer a {
            color: rgba(249, 240, 238, 0.5);
            text-decoration: none;
            font-size: 11px;
        }
        .footer a:hover {
            color: #f27361;
        }
        .footer-links {
            margin-top: 16px;
            width: 100%;
            overflow: hidden;
        }
        .footer-left {
            float: left;
            font-size: 11px;
            color: rgba(249, 240, 238, 0.4);
        }
        .footer-right {
            float: right;
            font-size: 11px;
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #100908;">
    <div class="email-container">
        <div class="email-content">
            <!-- Logo -->
            <div class="logo">
                <a href="https://findsomeone.app" class="logo-container">
                    <img src="https://findsomeone.app/logo-email.png" alt="FindSomeone" class="logo-svg" />
                    <span class="logo-brand">FindSomeone</span>
                </a>
            </div>

            <!-- Header -->
            <h1>Nowa wiadomość kontaktowa</h1>

            <!-- Info Box -->
            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Od:</span>
                    <span>${email}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Temat:</span>
                    <span>${subject}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Kategoria:</span>
                    <span>${category === 'support' ? 'Pomoc techniczna' : category === 'moderation' ? 'Sprawy moderacyjne' : category === 'complaints' ? 'Reklamacje' : category === 'gdpr' ? 'Sprawy RODO' : 'Kontakt ogólny'}</span>
                </div>
            </div>

            <!-- Message Box -->
            <div class="message-box">
                <h3>Treść wiadomości:</h3>
                <div class="message-content">${message}</div>
            </div>

            <div class="divider"></div>

            <!-- Footer -->
            <div class="footer">
                <p>Wiadomość wysłana z formularza kontaktowego FindSomeone</p>
                <div class="footer-links">
                    <span class="footer-left">© FindSomeone</span>
                    <span class="footer-right">
                        <a href="https://findsomeone.app/privacy">Polityka prywatności</a>
                        <a href="https://findsomeone.app/terms" style="margin-left: 16px;">Regulamin</a>
                    </span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
      `,
      text: `
Nowa wiadomość z formularza kontaktowego

Od: ${email}
Temat: ${subject}
Kategoria: ${category === 'support' ? 'Pomoc techniczna' : category === 'moderation' ? 'Sprawy moderacyjne' : category === 'complaints' ? 'Reklamacje' : category === 'gdpr' ? 'Sprawy RODO' : 'Kontakt ogólny'}

Treść wiadomości:
${message}

---
Wiadomość została wysłana z formularza kontaktowego na stronie findsomeone.app
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Wiadomość została wysłana pomyślnie',
        id: data?.id
      },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas wysyłania wiadomości' },
      { status: 500 }
    )
  }
}
