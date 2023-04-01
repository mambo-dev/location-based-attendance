import {
  useLoadScript,
  GoogleMap,
  Marker,
  MarkerF,
} from "@react-google-maps/api";
import { useMemo } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

//@ts-ignore
export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: `${API_KEY}`,
  });
  if (!isLoaded) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  return (
    <div>
      <MapComponent />
    </div>
  );
}

function MapComponent() {
  const center = useMemo(() => ({ lat: -0.250755, lng: 35.7300133 }), []);

  return (
    <GoogleMap
      zoom={15}
      center={center}
      mapContainerClassName="w-full min-h-screen"
    >
      <MarkerF position={center} title="marker" clickable />
    </GoogleMap>
  );
}
