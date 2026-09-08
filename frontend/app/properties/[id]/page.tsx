"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getErrorMessage } from "@/lib/api";
import { Property, Room } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import Loader from "@/components/Loader";
import Badge from "@/components/Badge";
import { MapPin, Users, BedDouble } from "lucide-react";
import toast from "react-hot-toast";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [actingRoomId, setActingRoomId] = useState<string | null>(null);
  const [viewingDate, setViewingDate] = useState("");

  async function fetchProperty() {
    setLoading(true);
    try {
      const { data } = await api.get(`/properties/${id}`);
      setProperty(data.data.property);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function requestViewing(room: Room) {
    if (!user) return toast.error("Please log in as a tenant to request a viewing");
    if (!viewingDate) return toast.error("Pick a date first");
    setActingRoomId(room.id);
    try {
      await api.post("/viewing-requests", {
        propertyId: property!.id,
        roomId: room.id,
        requestedDate: new Date(viewingDate).toISOString(),
      });
      toast.success("Viewing request sent!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingRoomId(null);
    }
  }

  async function applyToRoom(room: Room) {
    if (!user) return toast.error("Please log in as a tenant to apply");
    setActingRoomId(room.id);
    try {
      await api.post("/applications", { roomId: room.id });
      toast.success("Application submitted!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setActingRoomId(null);
    }
  }

  if (loading) return <Loader label="Loading property..." />;
  if (!property) return <p className="text-center py-16 text-gray-500">Property not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="h-56 bg-gray-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
        {property.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-300">No image</span>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-1">{property.title}</h1>
      <p className="text-gray-500 flex items-center gap-1 mb-3">
        <MapPin size={16} /> {property.address}
      </p>
      {property.description && <p className="text-gray-600 mb-4">{property.description}</p>}

      {property.amenities?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {property.amenities.map((a) => (
            <span key={a} className="badge bg-brand-50 text-brand-700">
              {a}
            </span>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Available Rooms</h2>
      <div className="mb-4">
        <label className="text-sm text-gray-600 mr-2">Preferred viewing date:</label>
        <input
          type="date"
          className="input inline-block w-auto"
          value={viewingDate}
          onChange={(e) => setViewingDate(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(property.rooms || []).map((room) => {
          const seatsLeft = room.availability?.[0]?.seatsLeft ?? 0;
          return (
            <div key={room.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-1">
                  <BedDouble size={16} /> Room {room.roomNo}
                </h3>
                <Badge status={room.status} />
              </div>
              <p className="text-sm text-gray-600 mb-1">
                ৳{Number(room.rentAmount).toLocaleString()}/month · {room.roomType.toLowerCase()}
              </p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                <Users size={12} /> {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left of {room.capacity}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => requestViewing(room)}
                  disabled={actingRoomId === room.id || room.status === "OCCUPIED"}
                  className="btn-secondary text-sm flex-1"
                >
                  Request Viewing
                </button>
                <button
                  onClick={() => applyToRoom(room)}
                  disabled={actingRoomId === room.id || room.status === "OCCUPIED"}
                  className="btn-primary text-sm flex-1"
                >
                  Apply
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
