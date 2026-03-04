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
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          category_id: string | null
          created_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          price: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name: string
          price: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'posts_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      site_stats: {
        Row: {
          id: number
          total_visits: number
        }
        Insert: {
          id?: number
          total_visits?: number
        }
        Update: {
          id?: number
          total_visits?: number
        }
        Relationships: []
      }
      site_visits: {
        Row: {
          id: string
          visited_at: string
        }
        Insert: {
          id?: string
          visited_at?: string
        }
        Update: {
          id?: string
          visited_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          last_seen_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          user_id?: string
        }
        Update: {
          last_seen_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_site_visits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
