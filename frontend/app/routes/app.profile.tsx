import { useEffect, useMemo, useRef, useState, type FormEvent, type ChangeEvent } from "react";
import type { Route } from "../+types/root";
import { useAuth } from "../context/AuthContext";
import { Avatar, Button, TextField, Card } from "../components/ui";
import { CountrySelect } from "../components/form/CountrySelect";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Profile - Sonare" },
    { name: "description", content: "Manage your profile data and avatar" },
  ];
}

interface FormState {
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  country: string;
  birthdate: string;
}

export default function ProfileRoute() {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [form, setForm] = useState<FormState>({
    displayName: "",
    firstName: "",
    lastName: "",
    bio: "",
    country: "",
    birthdate: "",
  });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      displayName: user.displayName ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      bio: user.bio ?? "",
      country: user.country ?? "",
      birthdate: user.birthdate ? user.birthdate.slice(0, 10) : "",
    });
  }, [user]);

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "";
    try {
      return new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(user.createdAt));
    } catch {
      return "";
    }
  }, [user?.createdAt]);

  const handleInputChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (value: string) => {
    setForm((prev) => ({ ...prev, country: value }));
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!form.displayName.trim() || !form.firstName.trim() || !form.lastName.trim()) {
      setStatus({ type: "error", message: "First name, last name and display name are required" });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateProfile({
        displayName: form.displayName.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim() ? form.bio.trim() : undefined,
        country: form.country.trim() ? form.country.trim() : undefined,
        birthdate: form.birthdate || undefined,
      });

      setForm({
        displayName: updated.displayName ?? "",
        firstName: updated.firstName ?? "",
        lastName: updated.lastName ?? "",
        bio: updated.bio ?? "",
        country: updated.country ?? "",
        birthdate: updated.birthdate ? updated.birthdate.slice(0, 10) : "",
      });
      setStatus({ type: "success", message: "Profile updated successfully" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Your profile could not be updated",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Select a valid image" });
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "The image must weigh less than 5MB" });
      event.target.value = "";
      return;
    }

    setIsUploading(true);

    try {
      await uploadAvatar(file);
      setStatus({ type: "success", message: "Your avatar has been updated" });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Your avatar could not be uploaded" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const currentAvatar = user?.avatarUrl ?? undefined;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-surface-800/80 bg-gradient-to-br from-surface-900 via-surface-900/80 to-surface-800 p-6 lg:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 opacity-40" aria-hidden>
          <div className="w-64 h-64 bg-primary-500/40 blur-[120px] -left-20 -top-20 absolute" />
          <div className="w-72 h-72 bg-indigo-500/25 blur-[140px] right-0 bottom-0 absolute" />
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative w-fit">
            <Avatar
              src={currentAvatar}
              alt={user?.displayName || user?.name || "Usuario"}
              size="xl"
              fallback={user?.displayName?.charAt(0) || user?.name?.charAt(0) || "U"}
              className="ring-4 ring-surface-900 shadow-2xl shadow-primary-500/40"
              loading="eager"
            />
            <label
              htmlFor="avatar-upload"
              className="absolute -bottom-2 -right-2 rounded-full bg-white/90 px-4 py-1 text-xs font-semibold text-surface-900 cursor-pointer shadow-lg shadow-primary-500/40 hover:scale-105 transition"
            >
              {isUploading ? "Subiendo..." : "Cambiar"}
            </label>
            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-surface-400">Profile</p>
              <h1 className="text-3xl font-semibold text-white">{user?.displayName || user?.name}</h1>
              {user?.name && (
                <p className="text-surface-400">@{user.name}</p>
              )}
            </div>
            {memberSince && (
              <p className="text-surface-300/80 text-sm">Member since {memberSince}</p>
            )}
            <div className="flex flex-wrap gap-3 items-center">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                Update photo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {status && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
            status.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {status.message}
        </div>
      )}

      <div>
        <Card className="bg-surface-900/80 border border-surface-800">
          <form className="space-y-6" onSubmit={handleProfileSubmit}>
            <div>
              <h2 className="text-xl font-semibold text-surface-50">Basic information</h2>
              <p className="text-sm text-surface-400">Control what others see about you.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Name"
                value={form.firstName}
                onChange={handleInputChange("firstName")}
                placeholder="Name"
                required
              />
              <TextField
                label="Last name"
                value={form.lastName}
                onChange={handleInputChange("lastName")}
                placeholder="Last name"
                required
              />
            </div>
            <TextField
              label="Display name"
              value={form.displayName}
              onChange={handleInputChange("displayName")}
              placeholder="This name accompanies your playlists"
              helperText="Must have at least 1 character"
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <CountrySelect
                value={form.country}
                onChange={handleCountryChange}
                helperText="Select the country that will be shown in your profile"
              />
              <TextField
                label="Birthdate"
                type="date"
                value={form.birthdate}
                onChange={handleInputChange("birthdate")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Biography</label>
              <textarea
                value={form.bio}
                onChange={handleInputChange("bio")}
                placeholder="Share your favorite genres, the playlist that never fails or the concert that marked you."
                maxLength={280}
                className="w-full min-h-[120px] px-4 py-3 bg-surface-800 border border-surface-700 rounded-2xl text-surface-50 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-right text-xs text-surface-500 mt-1">{form.bio.length}/280</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" isLoading={isSaving}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (!user) return;
                  setForm({
                    displayName: user.displayName ?? "",
                    firstName: user.firstName ?? "",
                    lastName: user.lastName ?? "",
                    bio: user.bio ?? "",
                    country: user.country ?? "",
                    birthdate: user.birthdate ? user.birthdate.slice(0, 10) : "",
                  });
                  setStatus(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
}
