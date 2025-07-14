"use client";

import { useState, useEffect } from 'react';
import { Search, MapPin, Star, Calendar, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// České specializace
const SPECIALIZATIONS = [
  { value: 'prakticky_lekar', label: 'Praktický lékař' },
  { value: 'kardiolog', label: 'Kardiolog' },
  { value: 'dermatolog', label: 'Dermatolog' },
  { value: 'neurolog', label: 'Neurolog' },
  { value: 'ortoped', label: 'Ortoped' },
  { value: 'gynekolog', label: 'Gynekolog' },
];

interface DoctorSearchProps {
  onDoctorSelect?: (doctor: any) => void;
}

export function DoctorSearch({ onDoctorSelect }: DoctorSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSpecialization) params.append('specialization', selectedSpecialization);
      if (selectedCity) params.append('city', selectedCity);
      
      const response = await fetch(`/api/doctors/search?${params}`);
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error('Chyba při vyhledávání:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtry */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Hledat lékaře podle jména..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                Hledat
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte specializaci" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Město"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Výsledky */}
      {loading && <div className="text-center">Hledám lékaře...</div>}
      
      <div className="grid gap-4">
        {doctors.map((doctor: any) => (
          <DoctorCard 
            key={doctor.id} 
            doctor={doctor} 
            onSelect={() => onDoctorSelect?.(doctor)}
          />
        ))}
      </div>
    </div>
  );
}