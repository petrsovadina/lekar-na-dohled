import { createClient } from '@supabase/supabase-js';

// Typy pro TypeScript
export interface Doctor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  city: string;
  rating: number | null;
  accepts_new_patients: boolean;
  has_online_booking: boolean;
  telemedicine_available: boolean;
}

export interface DoctorSearchParams {
  specialization?: string;
  city?: string;
  accepts_new_patients?: boolean;
  telemedicine_available?: boolean;
  min_rating?: number;
}

class DoctorService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  /**
   * Vyhledá lékaře podle zadaných kritérií
   */
  async searchDoctors(params: DoctorSearchParams = {}): Promise<Doctor[]> {
    let query = this.supabase
      .from('doctors')
      .select('*')
      .eq('is_verified', true);

    // Filtry
    if (params.specialization) {
      query = query.eq('specialization', params.specialization);
    }
    
    if (params.city) {
      query = query.ilike('city', `%${params.city}%`);
    }
    
    if (params.accepts_new_patients !== undefined) {
      query = query.eq('accepts_new_patients', params.accepts_new_patients);
    }
    
    if (params.telemedicine_available !== undefined) {
      query = query.eq('telemedicine_available', params.telemedicine_available);
    }
    
    if (params.min_rating) {
      query = query.gte('rating', params.min_rating);
    }

    // Řazení podle hodnocení
    query = query.order('rating', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Chyba při hledání lékařů: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Získá detaily konkrétního lékaře
   */
  async getDoctorById(id: number): Promise<Doctor | null> {
    const { data, error } = await this.supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Chyba při načítání lékaře: ${error.message}`);
    }

    return data;
  }
}

export const doctorService = new DoctorService();
