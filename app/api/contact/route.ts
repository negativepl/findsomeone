import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

// Validation schema
const contactSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  subject: z.string().min(3, 'Temat musi mieć minimum 3 znaki').max(200, 'Temat może mieć maksymalnie 200 znaków'),
  message: z.string().min(10, 'Wiadomość musi mieć minimum 10 znaków').max(5000, 'Wiadomość może mieć maksymalnie 5000 znaków'),
  category: z.enum(['general', 'support']).default('general'), // general = kontakt@, support = pomoc@
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = contactSchema.parse(body)
    const { email, subject, message, category } = validatedData

    // Determine recipient based on category
    const toEmail = category === 'support' ? 'pomoc@findsomeone.app' : 'kontakt@findsomeone.app'
    const fromEmail = category === 'support' ? 'pomoc@findsomeone.app' : 'kontakt@findsomeone.app'

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email, // User's email for easy reply
      subject: `[FindSomeone] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C44E35;">Nowa wiadomość z formularza kontaktowego</h2>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Od:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Temat:</strong> ${subject}</p>
            <p style="margin: 10px 0;"><strong>Kategoria:</strong> ${category === 'support' ? 'Pomoc techniczna' : 'Kontakt ogólny'}</p>
          </div>

          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #C44E35; margin: 20px 0;">
            <h3 style="margin-top: 0;">Treść wiadomości:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <p style="color: #666; font-size: 12px;">
            Wiadomość została wysłana z formularza kontaktowego na stronie findsomeone.app
          </p>
        </div>
      `,
      text: `
Nowa wiadomość z formularza kontaktowego

Od: ${email}
Temat: ${subject}
Kategoria: ${category === 'support' ? 'Pomoc techniczna' : 'Kontakt ogólny'}

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
