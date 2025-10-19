export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          phone: string | null
          city: string | null
          rating: number
          total_reviews: number
          verified: boolean
          is_company: boolean
          is_ai_bot: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          phone?: string | null
          city?: string | null
          rating?: number
          total_reviews?: number
          verified?: boolean
          is_company?: boolean
          is_ai_bot?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          phone?: string | null
          city?: string | null
          rating?: number
          total_reviews?: number
          verified?: boolean
          is_company?: boolean
          is_ai_bot?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          title: string
          description: string
          type: 'seeking' | 'offering'
          city: string
          district: string | null
          price_min: number | null
          price_max: number | null
          price_type: 'hourly' | 'fixed' | 'negotiable' | null
          images: string[] | null
          status: 'active' | 'closed' | 'completed'
          views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          title: string
          description: string
          type: 'seeking' | 'offering'
          city: string
          district?: string | null
          price_min?: number | null
          price_max?: number | null
          price_type?: 'hourly' | 'fixed' | 'negotiable' | null
          images?: string[] | null
          status?: 'active' | 'closed' | 'completed'
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          title?: string
          description?: string
          type?: 'seeking' | 'offering'
          city?: string
          district?: string | null
          price_min?: number | null
          price_max?: number | null
          price_type?: 'hourly' | 'fixed' | 'negotiable' | null
          images?: string[] | null
          status?: 'active' | 'closed' | 'completed'
          views?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          post_id: string | null
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          post_id?: string | null
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          post_id?: string | null
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewed_id: string
          post_id: string | null
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewed_id: string
          post_id?: string | null
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewed_id?: string
          post_id?: string | null
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
      saved_posts: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          post_id?: string
          created_at?: string
        }
      }
    }
  }
}
