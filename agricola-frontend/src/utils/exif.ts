// EXIF utilities for GPS extraction

declare global {
  interface Window {
    EXIF: any;
  }
}

export interface GpsCoordinates {
  lat: number;
  lng: number;
}

export const extractGpsFromImage = (file: File): Promise<GpsCoordinates | null> => {
  return new Promise((resolve) => {
    // Check if EXIF.js is available
    if (typeof window.EXIF === 'undefined') {
      console.warn('EXIF.js not loaded');
      resolve(null);
      return;
    }

    window.EXIF.getData(file, function(this: any) {
      const lat = window.EXIF.getTag(this, "GPSLatitude");
      const latRef = window.EXIF.getTag(this, "GPSLatitudeRef");
      const lon = window.EXIF.getTag(this, "GPSLongitude");
      const lonRef = window.EXIF.getTag(this, "GPSLongitudeRef");
      
      if (lat && lon && latRef && lonRef) {
        // Convert GPS coordinates to decimal degrees
        const latDecimal = convertDMSToDD(lat, latRef);
        const lonDecimal = convertDMSToDD(lon, lonRef);
        
        resolve({
          lat: latDecimal,
          lng: lonDecimal
        });
      } else {
        resolve(null);
      }
    });
  });
};

// Convert DMS (Degrees, Minutes, Seconds) to DD (Decimal Degrees)
const convertDMSToDD = (dms: number[], ref: string): number => {
  let dd = dms[0] + dms[1]/60 + dms[2]/(60*60);
  if (ref === "S" || ref === "W") {
    dd = dd * -1;
  }
  return dd;
};

export const formatCoordinates = (coordinates: GpsCoordinates): string => {
  return `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`;
};

// EXIF library is loaded dynamically in App.tsx
