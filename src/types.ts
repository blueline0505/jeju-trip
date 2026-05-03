export interface Spot {
  id: string;
  name: string;
  category: 'nature' | 'cafe' | 'food' | 'culture' | 'transport' | 'accommodation';
  description: string;
  address: string;
  imageUrl: string;
  naverMapLink: string;
  tips?: string;
  mustEat?: string;
  mustBuy?: string;
  reservationCode?: string;
  story?: string;
}

export interface WeatherInfo {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'windy';
  description: string;
}

export interface DayPlan {
  day: number;
  date: string;
  weather?: WeatherInfo;
  items: Spot[];
}

export interface FlightInfo {
  outbound: {
    airline: string;
    flightNo: string;
    depTime: string;
    arrTime: string;
  };
  inbound: {
    airline: string;
    flightNo: string;
    depTime: string;
    arrTime: string;
  };
}

export interface AccommodationInfo {
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  reservationNo: string;
}

export interface ExpenseItem {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export interface Itinerary {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  days: DayPlan[];
  flights: FlightInfo;
  accommodations: AccommodationInfo[];
  expenses: ExpenseItem[];
}
