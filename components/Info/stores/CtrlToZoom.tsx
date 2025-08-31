import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function CtrlToZoom() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    map.scrollWheelZoom.disable();

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        map.scrollWheelZoom.enable();
      } else {
        map.scrollWheelZoom.disable();
      }
    };

    container.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      container.removeEventListener("wheel", onWheel);
      map.scrollWheelZoom.enable();
    };
  }, [map]);

  return null;
}
