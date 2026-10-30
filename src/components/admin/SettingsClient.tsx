"use client";

import { useState, useTransition, useRef } from "react";
import { updateSettings, type SettingsMap } from "@/actions/settings";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import {
  Save,
  Palette,
  User,
  Loader2,
  RotateCcw,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  Share2,
  Plus,
  Trash2,
  Instagram,
  Youtube,
  Slack,
  Twitch,
  Globe,
  Link as LinkIcon,
  FileText,
  Upload,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  GraduationCap,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { type EducationItem, defaultEducationItems } from "@/lib/data";

type CustomLink = {
  label: string;
  url: string;
  icon: string;
};

const ICON_OPTIONS = [
  { label: "GitHub", value: "Github", icon: Github },
  { label: "LinkedIn", value: "Linkedin", icon: Linkedin },
  { label: "Twitter / X", value: "Twitter", icon: Twitter },
  { label: "Facebook", value: "Facebook", icon: Facebook },
  { label: "Instagram", value: "Instagram", icon: Instagram },
  { label: "YouTube", value: "Youtube", icon: Youtube },
  { label: "Discord", value: "Slack", icon: Slack },
  { label: "Twitch", value: "Twitch", icon: Twitch },
  { label: "Public Email", value: "Mail", icon: Mail },
  { label: "Website", value: "Globe", icon: Globe },
  { label: "Generic Link", value: "LinkIcon", icon: LinkIcon },
];

function SocialLinkItem({
  link,
  onUpdate,
  onRemove,
}: {
  link: CustomLink;
  onUpdate: (updates: Partial<CustomLink>) => void;
  onRemove: () => void;
}) {
  const [label, setLabel] = useState(link.label);
  const [url, setUrl] = useState(link.url);

  // Debounce link updating by 300ms so typing in one link does not re-render all others
  const debouncedUpdate = useDebouncedCallback((updates: Partial<CustomLink>) => {
    onUpdate(updates);
  }, 300);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLabel(val);
    debouncedUpdate({ label: val });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    debouncedUpdate({ url: val });
  };

  return (
    <div className="flex flex-col sm:flex-row items-end gap-3 p-4 border border-border rounded-xl bg-muted/20">
      <div className="grid gap-2 flex-1 w-full">
        <label className="text-xs font-medium uppercase text-muted-foreground">Label</label>
        <input
          value={label}
          onChange={handleLabelChange}
          placeholder="e.g. My GitHub"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-2 flex-1 w-full">
        <label className="text-xs font-medium uppercase text-muted-foreground">URL</label>
        <input
          value={url}
          onChange={handleUrlChange}
          placeholder="https://..."
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-2 w-full sm:w-40">
        <label className="text-xs font-medium uppercase text-muted-foreground">Platform</label>
        <select
          value={link.icon}
          onChange={(e) => onUpdate({ icon: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
        >
          {ICON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="h-10 w-10 flex items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
        title="Remove Link"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function EducationMilestoneItem({
  item,
  index,
  total,
  onUpdate,
  onRemove,
  onMove,
}: {
  item: EducationItem;
  index: number;
  total: number;
  onUpdate: (updates: Partial<EducationItem>) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}) {
  return (
    <div className="p-4 border border-border rounded-xl bg-muted/20 space-y-4">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
            {index + 1}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Milestone #{index + 1}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove("up")}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Move Up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove("down")}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Move Down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 transition-colors cursor-pointer ml-1"
            title="Delete Milestone"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <label className="text-xs font-medium uppercase text-muted-foreground">Year / Period</label>
          <input
            value={item.year}
            onChange={(e) => onUpdate({ year: e.target.value })}
            placeholder="e.g. 2019 - 2023"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono"
          />
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <label className="text-xs font-medium uppercase text-muted-foreground">Degree / Milestone Title</label>
          <input
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="e.g. Bachelor of Science in Information Technology"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-semibold"
          />
        </div>
      </div>

      <div className="grid gap-1.5">
        <label className="text-xs font-medium uppercase text-muted-foreground">School / Institution</label>
        <input
          value={item.subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="e.g. State University"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
        />
      </div>

      <div className="grid gap-1.5">
        <label className="text-xs font-medium uppercase text-muted-foreground">Description / Achievements</label>
        <textarea
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={2}
          placeholder="e.g. Graduated with honors. Specialized in Web and Mobile Application Development..."
          className="flex min-h-18 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}

export default function SettingsClient({ initialSettings }: { initialSettings: SettingsMap }) {
  const [settings] = useState<SettingsMap>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [localColor, setLocalColor] = useState(initialSettings.primary_color || "#3b82f6");
  const [hexInput, setHexInput] = useState(initialSettings.primary_color || "#3b82f6");
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Logo state
  const [logoText, setLogoText] = useState(initialSettings.logo_text ?? "AK");
  const [logoImageBase64, setLogoImageBase64] = useState<string>(initialSettings.logo_image || "");
  const [logoUrlInput, setLogoUrlInput] = useState<string>(
    initialSettings.logo_image && !initialSettings.logo_image.startsWith("data:") ? initialSettings.logo_image : ""
  );
  const [logoName, setLogoName] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Hero state
  const [heroTitle, setHeroTitle] = useState(initialSettings.hero_title ?? "Building digital products that");
  const [heroHighlight, setHeroHighlight] = useState(initialSettings.hero_highlight ?? "matter.");
  const [heroDescription, setHeroDescription] = useState(
    initialSettings.hero_description ??
      "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship."
  );

  // Education state
  const [educationTitle, setEducationTitle] = useState(
    initialSettings.education_title ?? "Education Attainment"
  );
  const [educationSubtitle, setEducationSubtitle] = useState(
    initialSettings.education_subtitle ?? "My academic journey and professional milestones."
  );
  const [educationItemsList, setEducationItemsList] = useState<EducationItem[]>(() => {
    try {
      if (!initialSettings.education_items) return defaultEducationItems;
      const parsed = JSON.parse(initialSettings.education_items);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEducationItems;
    } catch {
      return defaultEducationItems;
    }
  });

  // Custom social links
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(() => {
    try {
      return JSON.parse(initialSettings.custom_social_links || "[]");
    } catch {
      return [];
    }
  });

  // CV / Resume state
  const [cvBase64, setCvBase64] = useState<string>(initialSettings.cv_file || "");
  const [cvUrlInput, setCvUrlInput] = useState<string>(
    initialSettings.cv_file && !initialSettings.cv_file.startsWith("data:") ? initialSettings.cv_file : ""
  );
  const [cvName, setCvName] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // Debounced brand color handler to avoid palette recalculations on each typed character
  const debouncedSetColor = useDebouncedCallback((val: string) => {
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val)) {
      setLocalColor(val);
    }
  }, 300);

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    debouncedSetColor(val);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalColor(val);
    setHexInput(val);
  };

  // Logo handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoImageBase64(reader.result as string);
      setLogoUrlInput("");
      setIsUploadingLogo(false);
    };
    reader.onerror = () => {
      setIsUploadingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLogoUrlInput(val);
    setLogoImageBase64(val);
    setLogoName(val ? "Direct Image URL" : "");
  };

  // Debounced CV URL handler
  const debouncedSetCv = useDebouncedCallback((val: string) => {
    setCvBase64(val);
    setCvName(val ? "Direct Document URL" : "");
  }, 350);

  const handleCvUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCvUrlInput(val);
    debouncedSetCv(val);
  };

  // Education handlers
  const handleAddEducationItem = () => {
    setEducationItemsList((prev) => [
      ...prev,
      {
        year: "2024 - Present",
        title: "New Degree or Milestone",
        subtitle: "Institution / Organization",
        description: "Description of your studies, honors, or key achievements.",
      },
    ]);
  };

  const handleRemoveEducationItem = (index: number) => {
    setEducationItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateEducationItem = (index: number, updates: Partial<EducationItem>) => {
    setEducationItemsList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...updates };
      return updated;
    });
  };

  const handleMoveEducationItem = (index: number, direction: "up" | "down") => {
    setEducationItemsList((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleAddLink = () => {
    setCustomLinks([...customLinks, { label: "", url: "", icon: "LinkIcon" }]);
  };

  const handleRemoveLink = (index: number) => {
    setCustomLinks(customLinks.filter((_, i) => i !== index));
  };

  const handleUpdateLink = (index: number, updates: Partial<CustomLink>) => {
    setCustomLinks((prev) => {
      const newLinks = [...prev];
      newLinks[index] = { ...newLinks[index], ...updates };
      return newLinks;
    });
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setCvName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCvBase64(reader.result as string);
      setCvUrlInput("");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (formData: FormData) => {
    setStatus(null);
    formData.set("custom_social_links", JSON.stringify(customLinks));
    formData.set("cv_file", cvBase64);
    formData.set("logo_text", logoText);
    formData.set("logo_image", logoImageBase64);
    formData.set("hero_title", heroTitle);
    formData.set("hero_highlight", heroHighlight);
    formData.set("hero_description", heroDescription);
    formData.set("education_title", educationTitle);
    formData.set("education_subtitle", educationSubtitle);
    formData.set("education_items", JSON.stringify(educationItemsList));

    startTransition(async () => {
      const result = await updateSettings(formData);
      if (result.success) {
        setStatus({ type: "success", msg: "Settings updated successfully!" });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ type: "error", msg: result.error || "Failed to update" });
      }
    });
  };

  const handleResetDefaults = () => {
    setLocalColor("#3b82f6");
    setHexInput("#3b82f6");
    setLogoText("AK");
    setLogoImageBase64("");
    setLogoUrlInput("");
    setLogoName("");
    setHeroTitle("Building digital products that");
    setHeroHighlight("matter.");
    setHeroDescription(
      "QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship."
    );
    setEducationTitle("Education Attainment");
    setEducationSubtitle("My academic journey and professional milestones.");
    setEducationItemsList(defaultEducationItems);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Personal Info</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Customize your logo, hero intro, bio, education timeline, brand colors, resume, and social presence.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-8 pb-12">
        {/* Branding & Logo Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Branding & Identity</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Set your portfolio&apos;s accent color, navbar logo text, and custom icon.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-8">
            {/* Primary Brand Color */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <label className="text-sm font-medium">Primary Brand Color</label>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <input
                      type="color"
                      name="primary_color"
                      value={localColor}
                      onChange={handleColorPickerChange}
                      className="h-14 w-14 rounded-lg cursor-pointer border-2 border-border p-1 bg-background"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={hexInput}
                      onChange={handleHexChange}
                      placeholder="#HEXCODE"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">Select color or enter HEX code</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-xl bg-muted/10">
                <div className="text-center">
                  <div
                    className="h-12 w-12 rounded-full mx-auto mb-3 shadow-lg transition-colors"
                    style={{ backgroundColor: localColor }}
                  />
                  <p className="text-xs font-medium">Live Palette Preview</p>
                </div>
              </div>
            </div>

            {/* Navbar Logo Settings */}
            <div className="border-t border-border/80 pt-6 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-semibold">Navbar Logo</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Personalize the logo mark in the top-left corner of the site. Use initials/text, upload an image file (SVG, PNG, JPG, WebP), or both.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Logo Text / Initials</label>
                    <input
                      name="logo_text"
                      value={logoText}
                      onChange={(e) => setLogoText(e.target.value)}
                      placeholder="e.g. AK or Arn Kenneth"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-bold tracking-tight"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Displayed with the brand gradient. Leave empty if you only want an image logo.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Direct Logo Image URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={logoUrlInput}
                      onChange={handleLogoUrlChange}
                      placeholder="https://.../logo.png or /logo.svg"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-medium">Upload Logo Image (Optional)</label>
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:bg-muted/50 cursor-pointer transition-colors text-center"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold">Click to upload logo</p>
                      <p className="text-[10px] text-muted-foreground">PNG, SVG, JPG, WebP</p>
                    </div>
                    <input
                      type="file"
                      ref={logoInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*,.svg"
                      className="hidden"
                    />
                  </div>

                  {isUploadingLogo ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                      <span>Processing logo image...</span>
                    </div>
                  ) : logoImageBase64 ? (
                    <div className="flex items-center justify-between p-2.5 border border-border rounded-lg bg-muted/20">
                      <div className="flex items-center gap-2 truncate">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logoImageBase64}
                          alt="Logo thumbnail"
                          className="h-7 w-7 object-contain rounded bg-background border border-border/50"
                        />
                        <span className="text-xs font-medium truncate max-w-40 text-muted-foreground">
                          {logoName || "Custom logo active"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoImageBase64("");
                          setLogoUrlInput("");
                          setLogoName("");
                        }}
                        className="text-xs font-semibold text-destructive hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Live Navbar Logo Preview */}
              <div className="border border-border rounded-xl p-4 bg-muted/15 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Navbar Preview
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    How your logo renders in the public header
                  </p>
                </div>
                <div className="px-5 py-2.5 rounded-lg border border-border/60 bg-background/95 shadow-sm flex items-center gap-2.5">
                  {logoImageBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoImageBase64}
                      alt="Logo Preview"
                      className="h-7 w-auto max-h-7 max-w-28 object-contain rounded"
                    />
                  ) : null}
                  {(!logoImageBase64 || logoText) && (
                    <span
                      className="text-lg font-bold bg-clip-text text-transparent"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${localColor}, #a855f7)`,
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {logoText || (logoImageBase64 ? "" : "AK")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section Content */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Hero Section Content</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Customize the headline, accent highlight word, and introduction displayed on your homepage.
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Main Headline Prefix</label>
                <input
                  name="hero_title"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="e.g. Building digital products that"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">The primary headline statement.</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Highlight / Accent Word(s)</label>
                <input
                  name="hero_highlight"
                  value={heroHighlight}
                  onChange={(e) => setHeroHighlight(e.target.value)}
                  placeholder="e.g. matter."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                />
                <p className="text-[11px] text-muted-foreground">Rendered with your primary brand color.</p>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Hero Subtitle / Description</label>
              <textarea
                name="hero_description"
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={3}
                className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                placeholder="e.g. QA Engineer & Full-Stack Developer specializing in automated testing, reliable cloud architectures, and interface craftsmanship."
              />
              <p className="text-[11px] text-muted-foreground">Appears immediately beneath your headline on the homepage.</p>
            </div>

            {/* Live Hero Preview */}
            <div className="border border-border/80 rounded-xl p-6 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                <span>Live Hero Preview</span>
                <span className="text-[10px] uppercase tracking-wider">Homepage Banner</span>
              </div>
              <div className="pt-2 text-center max-w-2xl mx-auto space-y-3">
                <div className="text-2xl sm:text-3xl font-normal tracking-tight">
                  <span>{heroTitle}{heroTitle && !heroTitle.endsWith(" ") && heroHighlight ? " " : ""}</span>
                  {heroHighlight ? (
                    <span
                      className="font-bold inline-block transition-colors"
                      style={{ color: localColor }}
                    >
                      {heroHighlight}
                    </span>
                  ) : null}
                </div>
                {heroDescription ? (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {heroDescription}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* About Me Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">About Me Content</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bio Paragraph 1</label>
              <textarea
                name="about_me_1"
                defaultValue={settings.about_me_1}
                className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Bio Paragraph 2</label>
              <textarea
                name="about_me_2"
                defaultValue={settings.about_me_2}
                className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed"
                placeholder="Add more details..."
              />
            </div>
          </div>
        </div>

        {/* Education Attainment Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Education Attainment</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Manage your academic background, degrees, certifications, and timeline milestones.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddEducationItem}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Milestone
            </button>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Section Title</label>
                <input
                  name="education_title"
                  value={educationTitle}
                  onChange={(e) => setEducationTitle(e.target.value)}
                  placeholder="e.g. Education Attainment"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
                />
                <p className="text-[11px] text-muted-foreground">The headline shown above your education timeline.</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Section Subtitle</label>
                <input
                  name="education_subtitle"
                  value={educationSubtitle}
                  onChange={(e) => setEducationSubtitle(e.target.value)}
                  placeholder="e.g. My academic journey and professional milestones."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Brief subtext introducing this section.</p>
              </div>
            </div>

            {/* Milestones list */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Milestones & Degrees ({educationItemsList.length})</h3>
                <p className="text-xs text-muted-foreground">Ordered chronologically from top to bottom</p>
              </div>

              {educationItemsList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground italic border-2 border-dashed border-border rounded-xl">
                  No milestones added yet. Click &quot;Add Milestone&quot; to begin.
                </div>
              ) : (
                <div className="grid gap-4">
                  {educationItemsList.map((item, index) => (
                    <EducationMilestoneItem
                      key={index}
                      item={item}
                      index={index}
                      total={educationItemsList.length}
                      onUpdate={(updates) => handleUpdateEducationItem(index, updates)}
                      onRemove={() => handleRemoveEducationItem(index)}
                      onMove={(dir) => handleMoveEducationItem(index, dir)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Live Timeline Preview */}
            {educationItemsList.length > 0 && (
              <div className="border border-border/80 rounded-xl p-6 bg-muted/20 space-y-6 mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>Live Timeline Preview</span>
                  <span className="text-[10px] uppercase tracking-wider">Homepage Section</span>
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                    {educationTitle || "Education Attainment"}
                  </h3>
                  {educationSubtitle ? (
                    <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                      {educationSubtitle}
                    </p>
                  ) : null}
                </div>
                <div className="relative border-l-2 ml-4 md:ml-6 pl-6 space-y-6 pt-2" style={{ borderColor: `${localColor}40` }}>
                  {educationItemsList.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div
                        className="absolute -left-[31px] md:-left-[33px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-background transition-transform"
                        style={{ backgroundColor: localColor, boxShadow: `0 0 10px ${localColor}80` }}
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          {item.year && (
                            <span
                              className="text-xs font-mono font-bold"
                              style={{ color: localColor }}
                            >
                              {item.year}
                            </span>
                          )}
                          {item.title && (
                            <h4 className="text-sm font-bold text-foreground">
                              {item.title}
                            </h4>
                          )}
                        </div>
                        {item.subtitle && (
                          <p className="text-xs font-medium text-muted-foreground">
                            {item.subtitle}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-xs text-muted-foreground/90 leading-relaxed pt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Social Links Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Social Links</h2>
            </div>
            <button
              type="button"
              onClick={handleAddLink}
              className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Link
            </button>
          </div>
          <div className="p-6 space-y-4">
            {customLinks.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground italic border-2 border-dashed border-border rounded-xl">
                No social links added yet. Click &quot;Add Link&quot; to begin.
              </p>
            ) : (
              <div className="grid gap-4">
                {customLinks.map((link, index) => (
                  <SocialLinkItem
                    key={index}
                    link={link}
                    onUpdate={(updates) => handleUpdateLink(index, updates)}
                    onRemove={() => handleRemoveLink(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CV Upload Section */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Resume / CV</h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Curriculum Vitae (CV / Resume)</label>
                <p className="text-xs text-muted-foreground">
                  Provide a direct URL or upload your PDF/document directly.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Direct Document URL (Fastest CDN Delivery)
                </label>
                <input
                  type="text"
                  value={cvUrlInput}
                  onChange={handleCvUrlChange}
                  placeholder="https://.../cv.pdf or /cv.pdf"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-2">
                <div
                  onClick={() => cvInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-muted/50 cursor-pointer transition-colors text-center"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Click to upload new CV</p>
                    <p className="text-xs text-muted-foreground">or drag and drop here</p>
                  </div>
                  <input
                    type="file"
                    ref={cvInputRef}
                    onChange={handleCvUpload}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                </div>

                <div className="flex flex-col justify-center items-center p-6 border border-border rounded-xl bg-muted/10">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        Uploading...
                      </p>
                    </div>
                  ) : cvBase64 ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <CheckCircle2 className="h-7 w-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-green-600">CV Ready for Save</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-37.5">
                          {cvName || "File prepared"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCvBase64("");
                          setCvName("");
                          setCvUrlInput("");
                        }}
                        className="text-[10px] font-bold text-destructive hover:underline uppercase cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs font-medium uppercase">No file selected</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {status && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${
              status.type === "success"
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
          >
            {status.type === "success" ? <Save className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            <p className="text-sm font-medium">{status.msg}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:text-primary transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Defaults
          </button>
          <button
            type="submit"
            disabled={isPending || isUploading || isUploadingLogo}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Changes
          </button>
        </div>
      </form>
    </div>
  );
}
