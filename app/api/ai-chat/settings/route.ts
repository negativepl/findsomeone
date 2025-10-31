import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Public endpoint for chat assistant frontend settings
 * Returns welcome message and suggestions for the AI assistant
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('ai_settings')
      .select('chat_assistant_enabled, chat_assistant_welcome_message, chat_assistant_suggestions')
      .single()

    if (error) {
      console.error('Failed to fetch chat assistant settings:', error)
      // Return defaults if fetch fails
      return NextResponse.json({
        enabled: true,
        welcomeMessage: 'Cześć! Jestem tu aby pomóc\n\nMogę pomóc Ci w nawigacji, odpowiedzieć na pytania o FindSomeone lub pomóc znaleźć odpowiednie ogłoszenia.',
        suggestions: ['Jak dodać ogłoszenie?', 'Jak znaleźć specjalistę?', 'Jak działają opinie?']
      })
    }

    return NextResponse.json({
      enabled: data?.chat_assistant_enabled ?? true,
      welcomeMessage: data?.chat_assistant_welcome_message || 'Cześć! Jestem tu aby pomóc\n\nMogę pomóc Ci w nawigacji, odpowiedzieć na pytania o FindSomeone lub pomóc znaleźć odpowiednie ogłoszenia.',
      suggestions: data?.chat_assistant_suggestions || ['Jak dodać ogłoszenie?', 'Jak znaleźć specjalistę?', 'Jak działają opinie?']
    })
  } catch (error) {
    console.error('Error fetching chat assistant settings:', error)
    // Return defaults on error
    return NextResponse.json({
      enabled: true,
      welcomeMessage: 'Cześć! Jestem tu aby pomóc\n\nMogę pomóc Ci w nawigacji, odpowiedzieć na pytania o FindSomeone lub pomóc znaleźć odpowiednie ogłoszenia.',
      suggestions: ['Jak dodać ogłoszenie?', 'Jak znaleźć specjalistę?', 'Jak działają opinie?']
    })
  }
}
