import { Itinerary } from '../types';

export function encodeItinerary(itinerary: Itinerary): string {
  try {
    const json = JSON.stringify(itinerary);
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.error('Failed to encode itinerary', e);
    return '';
  }
}

export function decodeItinerary(hash: string): Itinerary | null {
  try {
    const json = decodeURIComponent(escape(atob(hash)));
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode itinerary', e);
    return null;
  }
}

export function getShareUrl(itinerary: Itinerary): string {
  const hash = encodeItinerary(itinerary);
  const url = new URL(window.location.href);
  url.searchParams.set('p', hash);
  return url.toString();
}
