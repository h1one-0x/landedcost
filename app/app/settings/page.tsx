"use client";

import { useState, useEffect } from "react";
import { Save, Building2, DollarSign, Loader2, Check } from "lucide-react";
import TopBar from "@/components/layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";
import { getProfile, updateProfile } from "@/lib/supabase-db";

export default function SettingsPage() {
  const { user } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [defaultMarkup, setDefaultMarkup] = useState("30");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id)
      .then((profile) => {
        setCompanyName(profile.company_name || "");
        setEmail(profile.email || user.email || "");
        setDefaultMarkup(String(profile.default_markup_pct ?? 30));
      })
      .catch(() => {
        setEmail(user.email || "");
      })
      .finally(() => setLoading(false));
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        company_name: companyName,
        email,
        default_markup_pct: Number(defaultMarkup),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col">
        <TopBar breadcrumbs={[{ label: "Dashboard", href: "/app" }, { label: "Settings" }]} />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <TopBar
        breadcrumbs={[
          { label: "Dashboard", href: "/app" },
          { label: "Settings" },
        ]}
        onSave={handleSave}
      />

      <div className="mx-auto w-full max-w-3xl p-6">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Configure your company profile.
        </p>

        {/* Company Settings */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-accent" />
              Company Settings
            </CardTitle>
            <CardDescription>
              Your company information used in reports and invoices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-text-secondary">Company Name</Label>
              <Input
                className="mt-1"
                placeholder="e.g. Acme Imports LLC"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary">Email</Label>
              <Input
                className="mt-1"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-text-secondary">Default Markup (%)</Label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  step="0.1"
                  value={defaultMarkup}
                  onChange={(e) => setDefaultMarkup(e.target.value)}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                  %
                </span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg-base transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saved ? "Saved!" : "Save Settings"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
