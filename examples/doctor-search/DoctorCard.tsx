import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Calendar, Video, Phone } from 'lucide-react';

interface DoctorCardProps {
  doctor: {
    id: number;
    first_name: string;
    last_name: string;
    specialization: string;
    city: string;
    rating: number | null;
    review_count: number;
    accepts_new_patients: boolean;
    has_online_booking: boolean;
    telemedicine_available: boolean;
  };
  onSelect: () => void;
}

export function DoctorCard({ doctor, onSelect }: DoctorCardProps) {
  const specializationLabels: Record<string, string> = {
    prakticky_lekar: 'Praktický lékař',
    kardiolog: 'Kardiolog',
    dermatolog: 'Dermatolog',
    neurolog: 'Neurolog',
    ortoped: 'Ortoped',
    gynekolog: 'Gynekolog',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {doctor.first_name} {doctor.last_name}
            </h3>
            
            <p className="text-blue-600 font-medium">
              {specializationLabels[doctor.specialization] || doctor.specialization}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {doctor.city}
              </div>
              
              {doctor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{doctor.rating}</span>
                  <span>({doctor.review_count} hodnocení)</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-3">
              {doctor.accepts_new_patients && (
                <Badge variant="success">Přijímá nové pacienty</Badge>
              )}
              {doctor.has_online_booking && (
                <Badge variant="secondary">
                  <Calendar className="w-3 h-3 mr-1" />
                  Online rezervace
                </Badge>
              )}
              {doctor.telemedicine_available && (
                <Badge variant="secondary">
                  <Video className="w-3 h-3 mr-1" />
                  Telemedicína
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={onSelect} size="sm">
              Zobrazit profil
            </Button>
            {doctor.has_online_booking && (
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-1" />
                Rezervovat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
