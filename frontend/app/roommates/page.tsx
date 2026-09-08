"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, getErrorMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Users, Home as HomeIcon } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface RoommateMatch {
  score: number;
  profile: {
    id: string;
    userId: string;
    preferredLocation?: string | null;
    lifestyleTags: string[];
    budgetMin: number;
    budgetMax: number;
    bio?: string | null;
    user: { id: string; name: string; avatarUrl?: string | null };
  };
}

interface RoomMatch {
  score: number;
  room: {
    id: string;
    roomNo: string;
    rentAmount: number | string;
    property: { id: string; title: string; city?: string | null };
  };
}

export default function RoommatesPage() {
  const { user, loading: authLoading } = useAuth();
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [lifestyleTags, setLifestyleTags] = useState("");
  const [saving, setSaving] = useState(false);

  const [roommateMatches, setRoommateMatches] = useState<RoommateMatch[]>([]);
  const [roomMatches, setRoomMatches] = useState<RoomMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    if (user) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function loadProfile() {
    try {
      const { data } = await api.get("/roommates/profile");
      const p = data.data.profile;
      setBudgetMin(String(p.budgetMin));
      setBudgetMax(String(p.budgetMax));
      setPreferredLocation(p.preferredLocation || "");
      setLifestyleTags((p.lifestyleTags || []).join(", "));
      loadMatches();
    } catch {
      // no profile yet — that's fine, user will create one
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/roommates/profile", {
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        preferredLocation: preferredLocation || undefined,
        lifestyleTags: lifestyleTags
          ? lifestyleTags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      });
      toast.success("Profile saved!");
      loadMatches();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function loadMatches() {
    setMatchesLoading(true);
    try {
      const [rm, rmr] = await Promise.all([
        api.get("/roommates/matches"),
        api.get("/roommates/room-matches"),
      ]);
      setRoommateMatches(rm.data.data.matches);
      setRoomMatches(rmr.data.data.matches);
    } catch {
      // profile might not exist yet
    } finally {
      setMatchesLoading(false);
    }
  }

  if (authLoading) return <Loader />;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Users className="mx-auto text-brand-500 mb-4" size={32} />
        <h1 className="text-xl font-bold mb-2">Find your roommate match</h1>
        <p className="text-gray-500 mb-4">Log in to set your preferences and see matches.</p>
        <Link href="/login" className="btn-primary">
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <h1 className="text-xl font-bold mb-4">Your Roommate Profile</h1>
        <form onSubmit={saveProfile} className="card space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Budget min</label>
              <input
                type="number"
                required
                className="input"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Budget max</label>
              <input
                type="number"
                required
                className="input"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Preferred location</label>
            <input
              className="input"
              placeholder="e.g. Dhaka"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Lifestyle tags (comma-separated)</label>
            <input
              className="input"
              placeholder="non-smoker, night-owl, pet-friendly"
              value={lifestyleTags}
              onChange={(e) => setLifestyleTags(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? "Saving..." : "Save & Find Matches"}
          </button>
        </form>
      </div>

      <div className="md:col-span-2 space-y-8">
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Users size={18} /> Roommate Matches
          </h2>
          {matchesLoading ? (
            <Loader label="Finding matches..." />
          ) : roommateMatches.length === 0 ? (
            <p className="text-sm text-gray-500">Save your profile to see roommate matches.</p>
          ) : (
            <div className="space-y-2">
              {roommateMatches.map((m) => (
                <div key={m.profile.id} className="card flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.profile.user.name}</p>
                    <p className="text-xs text-gray-500">
                      ৳{m.profile.budgetMin}–{m.profile.budgetMax} ·{" "}
                      {m.profile.preferredLocation || "Any location"}
                    </p>
                    {m.profile.lifestyleTags?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{m.profile.lifestyleTags.join(", ")}</p>
                    )}
                  </div>
                  <span className="badge bg-brand-50 text-brand-700">{m.score}% match</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <HomeIcon size={18} /> Room Matches
          </h2>
          {matchesLoading ? (
            <Loader label="Finding rooms..." />
          ) : roomMatches.length === 0 ? (
            <p className="text-sm text-gray-500">No room matches yet.</p>
          ) : (
            <div className="space-y-2">
              {roomMatches.map((m) => (
                <Link
                  key={m.room.id}
                  href={`/properties/${m.room.property.id}`}
                  className="card flex items-center justify-between hover:shadow-md transition block"
                >
                  <div>
                    <p className="font-medium">{m.room.property.title}</p>
                    <p className="text-xs text-gray-500">
                      Room {m.room.roomNo} · ৳{Number(m.room.rentAmount).toLocaleString()}/month ·{" "}
                      {m.room.property.city || ""}
                    </p>
                  </div>
                  <span className="badge bg-brand-50 text-brand-700">{m.score}% match</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
