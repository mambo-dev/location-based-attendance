import {
  useLoadScript,
  GoogleMap,
  Marker,
  MarkerF,
  Circle,
  CircleF,
} from "@react-google-maps/api";
import { useEffect, useMemo, useState, useCallback } from "react";
import { HandleError } from "../../backend-utils/types";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

type Props = {
  lat: any;
  lng: any;
  setIsWithinRegion: any;
  isWithinRegion: any;
  setErrors: React.Dispatch<React.SetStateAction<HandleError[]>>;
};

//@ts-ignore
export default function Map({
  lat,
  lng,
  setIsWithinRegion,
  isWithinRegion,
  setErrors,
}: Props) {
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
      <MapComponent
        lat={lat}
        lng={lng}
        setIsWithinRegion={setIsWithinRegion}
        isWithinRegion={isWithinRegion}
        setErrors={setErrors}
      />
    </div>
  );
}

const radius = 17;
function MapComponent({
  lat,
  lng,
  setIsWithinRegion,
  isWithinRegion,
  setErrors,
}: Props) {
  const center = useMemo(() => ({ lat, lng }), [lat, lng]);

  const [location, setLocation] = useState<{
    lat: any;
    lng: any;
  } | null>(null);

  const handlePositionChange = useCallback(
    (position: any) => {
      if (position.coords.accuracy > 10) {
        setErrors([
          {
            message: "The GPS accuracy isn't good enough",
          },
        ]);
      }
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      const distance =
        window.google.maps.geometry?.spherical.computeDistanceBetween(
          new window.google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          ),
          new window.google.maps.LatLng(center.lat, center.lng)
        );

      setIsWithinRegion(distance <= radius);
    },
    [setErrors, location, setIsWithinRegion]
  );

  const readLocation = useCallback(() => {
    const geoId = navigator.geolocation.watchPosition(
      handlePositionChange,
      (e) => {
        setErrors([
          {
            message: e.message,
          },
        ]);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    return () => {
      console.log("Clear watch called");
      window.navigator.geolocation.clearWatch(geoId);
    };
  }, [handlePositionChange, setErrors]);

  useEffect(() => {
    readLocation();
  }, [readLocation]);

  return (
    <GoogleMap
      zoom={18}
      center={center}
      mapContainerClassName="w-full min-h-screen"
    >
      <MarkerF position={center} title="marker" clickable />
      <CircleF
        center={center}
        radius={radius}
        options={{
          strokeColor: "#FFBBBB",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FFBBBB",
          fillOpacity: 0.35,
        }}
      />
    </GoogleMap>
  );
}

//-0.7216696720151901, 36.43534808650609
