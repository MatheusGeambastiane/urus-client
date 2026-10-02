"use client";

import type { ChangeEvent, PointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { fetchWithAuth } from "@/shared/auth/auth-fetch";
import { publicEnv } from "@/shared/config/public-env";
import { Input } from "@/shared/ui/input";
import type { UserProfile } from "../types/user-profile";

const cropSize = 220;

type ProfilePageProps = {
  accessToken?: string | null;
};

type CropOffset = { x: number; y: number };

type FormValues = {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  date_of_birth: string;
};

const emptyForm: FormValues = {
  name: "",
  email: "",
  cpf: "",
  phone: "",
  date_of_birth: "",
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const maskCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  if (!digits) return "";
  if (digits.length <= 3) return part1;
  if (digits.length <= 6) return `${part1}.${part2}`;
  if (digits.length <= 9) return `${part1}.${part2}.${part3}`;
  return `${part1}.${part2}.${part3}-${part4}`;
};

const maskPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const first = digits.slice(2, 3);
  const part1 = digits.slice(3, 7);
  const part2 = digits.slice(7, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${ddd}`;
  if (digits.length <= 3) return `(${ddd})${first}`;
  if (digits.length <= 7) return `(${ddd})${first} ${part1}`;
  return `(${ddd})${first} ${part1}-${part2}`;
};

const maskBirthDate = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  if (digits.length <= 2) return day;
  if (digits.length <= 4) return `${day}/${month}`;
  return `${day}/${month}/${year}`;
};

const formatBirthDate = (value: string | null | undefined) => {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : maskBirthDate(value);
};

const parseBirthDate = (value: string) => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    parsed.getFullYear() !== Number(year)
    || parsed.getMonth() !== Number(month) - 1
    || parsed.getDate() !== Number(day)
    || parsed > new Date()
  ) {
    return null;
  }
  return `${year}-${month}-${day}`;
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem."));
    img.src = src;
  });

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path
      d="M4 20h4L19 9l-4-4L4 16v4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="m13.5 6.5 4 4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const CancelIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
    <path d="M7 3v3M17 3v3M4 9h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <rect x="4" y="5" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

type FieldEditButtonProps = {
  editing: boolean;
  label: string;
  onEdit: () => void;
  onCancel: () => void;
};

const FieldEditButton = ({ editing, label, onEdit, onCancel }: FieldEditButtonProps) => (
  <button
    type="button"
    onClick={editing ? onCancel : onEdit}
    aria-label={editing ? `Cancelar edição de ${label}` : `Editar ${label}`}
    title={editing ? "Cancelar edição" : "Editar"}
    className={`absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 ${
      editing
        ? "text-red-600 hover:text-red-700"
        : "text-ink-500 hover:text-ink-900"
    }`}
  >
    {editing ? <CancelIcon /> : <EditIcon />}
  </button>
);

export const ProfilePage = ({ accessToken }: ProfilePageProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(emptyForm);
  const [birthDateInput, setBirthDateInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [photoMenuOpen, setPhotoMenuOpen] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [photoEditorOpen, setPhotoEditorOpen] = useState(false);
  const [photoOverrideUrl, setPhotoOverrideUrl] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropImageSize, setCropImageSize] = useState({ width: 0, height: 0 });
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CropOffset>({ x: 0, y: 0 });
  const [offsetStart, setOffsetStart] = useState<CropOffset>({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const birthDatePickerRef = useRef<HTMLInputElement>(null);

  const displayPhoto = photoOverrideUrl ?? profile?.profile_pic ?? null;
  const hasPendingChanges = isEditing || pendingPhoto !== null;

  const cropMetrics = useMemo(() => {
    const { width, height } = cropImageSize;
    if (!width || !height) {
      return {
        baseScale: 1,
        scaledWidth: cropSize,
        scaledHeight: cropSize,
        maxOffsetX: 0,
        maxOffsetY: 0,
      };
    }
    const baseScale = Math.max(cropSize / width, cropSize / height);
    const scaledWidth = width * baseScale * cropZoom;
    const scaledHeight = height * baseScale * cropZoom;
    const maxOffsetX = Math.max(0, (scaledWidth - cropSize) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - cropSize) / 2);
    return { baseScale, scaledWidth, scaledHeight, maxOffsetX, maxOffsetY };
  }, [cropImageSize, cropZoom]);

  const clampOffset = (next: CropOffset) => {
    const { maxOffsetX, maxOffsetY } = cropMetrics;
    return {
      x: Math.min(maxOffsetX, Math.max(-maxOffsetX, next.x)),
      y: Math.min(maxOffsetY, Math.max(-maxOffsetY, next.y)),
    };
  };

  useEffect(() => {
    let active = true;
    const fetchProfile = async () => {
      if (!accessToken) {
        setError("Sessao expirada. Entre novamente.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { response } = await fetchWithAuth(
          `${publicEnv.apiBaseUrl}/webapp/users/me/`,
          { cache: "no-store" },
          { accessToken }
        );
        if (!response.ok) {
          throw new Error("Falha ao carregar perfil.");
        }
        const data = (await response.json()) as UserProfile;
        if (!active) return;
        setProfile(data);
        setFormValues({
          name: data.name ?? "",
          email: data.email ?? "",
          cpf: data.cpf ?? "",
          phone: data.phone ?? "",
          date_of_birth: data.date_of_birth ?? "",
        });
        setBirthDateInput(formatBirthDate(data.date_of_birth));
      } catch (fetchError) {
        if (active) {
          setError("Nao foi possivel carregar o perfil.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProfile();
    return () => {
      active = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!cropImageUrl) {
      setCropImageSize({ width: 0, height: 0 });
      return undefined;
    }
    let active = true;
    const url = cropImageUrl;
    void loadImage(url)
      .then((img) => {
        if (!active) return;
        setCropImageSize({ width: img.naturalWidth, height: img.naturalHeight });
        setCropOffset({ x: 0, y: 0 });
      })
      .catch(() => null);

    return () => {
      active = false;
      URL.revokeObjectURL(url);
    };
  }, [cropImageUrl]);

  useEffect(() => {
    if (!photoOverrideUrl) return undefined;
    return () => {
      URL.revokeObjectURL(photoOverrideUrl);
    };
  }, [photoOverrideUrl]);

  useEffect(() => {
    setCropOffset((prev) => clampOffset(prev));
  }, [cropMetrics.maxOffsetX, cropMetrics.maxOffsetY]);

  const enableEditing = () => {
    setIsEditing(true);
    setSaveError(null);
  };

  const cancelEditing = () => {
    setFormValues({
      name: profile?.name ?? "",
      email: profile?.email ?? "",
      cpf: profile?.cpf ?? "",
      phone: profile?.phone ?? "",
      date_of_birth: profile?.date_of_birth ?? "",
    });
    setBirthDateInput(formatBirthDate(profile?.date_of_birth));
    setPendingPhoto(null);
    setPhotoOverrideUrl(null);
    setIsEditing(false);
    setSaveError(null);
  };

  const handleFieldChange = (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (field === "cpf" || field === "phone") {
        setFormValues((prev) => ({
          ...prev,
          [field]: onlyDigits(value),
        }));
        return;
      }
      setFormValues((prev) => ({ ...prev, [field]: value }));
    };

  const openBirthDatePicker = () => {
    const picker = birthDatePickerRef.current;
    if (!picker) return;
    try {
      picker.showPicker();
    } catch {
      picker.click();
    }
  };

  const handlePhotoEditClick = () => {
    setPhotoMenuOpen(false);
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveError("Formato de imagem invalido.");
      return;
    }
    const url = URL.createObjectURL(file);
    setCropImageUrl(url);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setPhotoEditorOpen(true);
  };

  const handleCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!photoEditorOpen) return;
    setDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
    setOffsetStart(cropOffset);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    setCropOffset(clampOffset({
      x: offsetStart.x + deltaX,
      y: offsetStart.y + deltaY,
    }));
  };

  const handleCropPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const createCroppedBlob = async () => {
    if (!cropImageUrl) return null;
    const img = await loadImage(cropImageUrl);
    const { baseScale } = cropMetrics;
    const scale = baseScale * cropZoom;
    const scaledWidth = img.naturalWidth * scale;
    const scaledHeight = img.naturalHeight * scale;
    const left = cropSize / 2 - scaledWidth / 2 + cropOffset.x;
    const top = cropSize / 2 - scaledHeight / 2 + cropOffset.y;
    const sx = Math.max(0, (-left) / scale);
    const sy = Math.max(0, (-top) / scale);
    const sWidth = Math.min(img.naturalWidth, cropSize / scale);
    const sHeight = Math.min(img.naturalHeight, cropSize / scale);

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.92
      );
    });
  };

  const handleCropSave = async () => {
    try {
      const blob = await createCroppedBlob();
      if (!blob) return;
      const file = new File([blob], `profile-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const url = URL.createObjectURL(blob);
      setPendingPhoto(file);
      setPhotoOverrideUrl(url);
      setPhotoEditorOpen(false);
    } catch (cropError) {
      setSaveError("Nao foi possivel cortar a imagem.");
    }
  };

  const handleSave = async () => {
    if (!accessToken) {
      setSaveError("Sessao expirada. Entre novamente.");
      return;
    }
    if (!formValues.name.trim() || !formValues.email.trim() || !formValues.phone.trim()) {
      setSaveError("Preencha nome, email e telefone antes de salvar.");
      return;
    }
    const parsedBirthDate = birthDateInput ? parseBirthDate(birthDateInput) : "";
    if (birthDateInput && !parsedBirthDate) {
      setSaveError("Informe uma data de nascimento válida no formato DD/MM/AAAA.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const body = new FormData();
      body.append("name", formValues.name);
      body.append("email", formValues.email);
      body.append("cpf", formValues.cpf);
      body.append("phone", formValues.phone);
      body.append("date_of_birth", parsedBirthDate ?? "");
      if (pendingPhoto) {
        body.append("profile_pic", pendingPhoto);
      }

      const { response } = await fetchWithAuth(
        `${publicEnv.apiBaseUrl}/webapp/users/me/`,
        { method: "PATCH", body },
        { accessToken }
      );

      if (!response.ok) {
        throw new Error("Falha ao salvar perfil.");
      }

      const data = (await response.json()) as UserProfile;
      setProfile(data);
      setFormValues((current) => ({
        ...current,
        date_of_birth: data.date_of_birth ?? "",
      }));
      setBirthDateInput(formatBirthDate(data.date_of_birth));
      setIsEditing(false);
      setPendingPhoto(null);
      setPhotoOverrideUrl(null);
      setToastMessage("Informacoes alteradas com sucesso.");
      window.setTimeout(() => setToastMessage(null), 3000);
    } catch (saveError) {
      setSaveError("Nao foi possivel salvar as alteracoes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 px-4 pb-28 pt-8">
      {toastMessage ? (
        <div className="fixed top-6 left-1/2 z-40 -translate-x-1/2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-soft">
          {toastMessage}
        </div>
      ) : null}
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-ink-400">
          Perfil
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-900">
          Meu perfil
        </h1>
        <p className="text-sm text-ink-600">
          Atualize seus dados pessoais e foto.
        </p>
      </header>

      {loading ? (
        <div className="rounded-3xl bg-white px-4 py-5 text-sm text-ink-500 shadow-soft">
          Carregando perfil...
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-white px-4 py-5 text-sm text-red-600 shadow-soft">
          {error}
        </div>
      ) : (
        <>
          <section className="relative flex flex-col items-center gap-4 rounded-3xl bg-white px-4 py-6 shadow-soft">
            <div className="relative">
              <button
                type="button"
                onClick={() => setPhotoMenuOpen((prev) => !prev)}
                className="relative flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-full border-4 border-ink-100 bg-ink-50"
                aria-label="Opcoes da foto"
              >
                {displayPhoto ? (
                  <img
                    src={displayPhoto}
                    alt={formValues.name || "Foto do perfil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-semibold text-ink-500">
                    {formValues.name
                      ? formValues.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                      : "UR"}
                  </span>
                )}
              </button>

              {photoMenuOpen ? (
                <div className="absolute left-1/2 top-full z-10 mt-3 w-40 -translate-x-1/2 rounded-2xl bg-white p-2 text-sm shadow-soft">
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoMenuOpen(false);
                      setPhotoViewerOpen(true);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-ink-700 transition hover:bg-ink-100"
                  >
                    Ver foto
                  </button>
                  <button
                    type="button"
                    onClick={handlePhotoEditClick}
                    className="w-full rounded-xl px-3 py-2 text-left text-ink-700 transition hover:bg-ink-100"
                  >
                    Editar foto
                  </button>
                </div>
              ) : null}
            </div>
            <p className="text-sm text-ink-500">
              Toque na foto para ver ou atualizar.
            </p>
          </section>

          <fieldset className="space-y-4">
            <div className="block text-sm text-ink-600">
              <label htmlFor="profile-name">Nome <span className="font-semibold text-red-600" aria-hidden="true">*</span></label>
              <span className="relative mt-2 block">
                <Input
                  id="profile-name"
                  value={formValues.name}
                  onChange={handleFieldChange("name")}
                  disabled={!isEditing}
                  className="pr-14 disabled:bg-ink-50 disabled:text-ink-500"
                />
                <FieldEditButton
                  editing={isEditing}
                  label="nome"
                  onEdit={enableEditing}
                  onCancel={cancelEditing}
                />
              </span>
            </div>
            <div className="block text-sm text-ink-600">
              <label htmlFor="profile-email">Email <span className="font-semibold text-red-600" aria-hidden="true">*</span></label>
              <span className="relative mt-2 block">
                <Input
                  id="profile-email"
                  type="email"
                  value={formValues.email}
                  onChange={handleFieldChange("email")}
                  disabled={!isEditing}
                  className="pr-14 disabled:bg-ink-50 disabled:text-ink-500"
                />
                <FieldEditButton
                  editing={isEditing}
                  label="email"
                  onEdit={enableEditing}
                  onCancel={cancelEditing}
                />
              </span>
            </div>
            <div className="block text-sm text-ink-600">
              <label htmlFor="profile-phone">Telefone <span className="font-semibold text-red-600" aria-hidden="true">*</span></label>
              <span className="relative mt-2 block">
                <Input
                  id="profile-phone"
                  type="tel"
                  value={maskPhone(formValues.phone)}
                  onChange={handleFieldChange("phone")}
                  disabled={!isEditing}
                  className="pr-14 disabled:bg-ink-50 disabled:text-ink-500"
                />
                <FieldEditButton
                  editing={isEditing}
                  label="telefone"
                  onEdit={enableEditing}
                  onCancel={cancelEditing}
                />
              </span>
            </div>
            <div className="block text-sm text-ink-600">
              <label htmlFor="profile-cpf">CPF</label>
              <span className="relative mt-2 block">
                <Input
                  id="profile-cpf"
                  inputMode="numeric"
                  value={maskCpf(formValues.cpf)}
                  onChange={handleFieldChange("cpf")}
                  disabled={!isEditing}
                  className="pr-14 disabled:bg-ink-50 disabled:text-ink-500"
                />
                <FieldEditButton
                  editing={isEditing}
                  label="CPF"
                  onEdit={enableEditing}
                  onCancel={cancelEditing}
                />
              </span>
            </div>
            <div className="block text-sm text-ink-600">
              <label htmlFor="profile-birth-date">Data de nascimento</label>
              <span className="relative mt-2 block">
                <Input
                  id="profile-birth-date"
                  type="text"
                  inputMode="numeric"
                  autoComplete="bday"
                  placeholder="DD/MM/AAAA"
                  value={birthDateInput}
                  onChange={(event) => setBirthDateInput(maskBirthDate(event.target.value))}
                  disabled={!isEditing}
                  className={isEditing ? "pr-24" : "pr-14 disabled:bg-ink-50 disabled:text-ink-500"}
                />
                {isEditing ? (
                  <button
                    type="button"
                    onClick={openBirthDatePicker}
                    aria-label="Selecionar data de nascimento no calendário"
                    title="Abrir calendário"
                    className="absolute right-12 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-ink-100 text-ink-600 transition hover:bg-ink-200 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2"
                  >
                    <CalendarIcon />
                  </button>
                ) : null}
                <FieldEditButton
                  editing={isEditing}
                  label="data de nascimento"
                  onEdit={enableEditing}
                  onCancel={cancelEditing}
                />
                <input
                  ref={birthDatePickerRef}
                  type="date"
                  value={parseBirthDate(birthDateInput) ?? ""}
                  onChange={(event) => {
                    setFormValues((current) => ({
                      ...current,
                      date_of_birth: event.target.value,
                    }));
                    setBirthDateInput(formatBirthDate(event.target.value));
                  }}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="pointer-events-none absolute h-px w-px opacity-0"
                />
              </span>
            </div>
          </fieldset>

          {saveError ? (
            <div className="rounded-3xl bg-white px-4 py-4 text-sm text-red-600 shadow-soft">
              {saveError}
            </div>
          ) : null}

          {hasPendingChanges ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink-900 px-6 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-900 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
          ) : null}
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoFileChange}
      />

      {photoViewerOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/70 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-700">Foto</h2>
              <button
                type="button"
                onClick={() => setPhotoViewerOpen(false)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-100"
              >
                Fechar
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt="Foto do perfil"
                  className="h-64 w-64 rounded-3xl object-cover"
                />
              ) : (
                <div className="flex h-64 w-64 items-center justify-center rounded-3xl bg-ink-100 text-ink-500">
                  Sem foto
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {photoEditorOpen && cropImageUrl ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink-900/70 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-700">
                Ajustar foto
              </h2>
              <button
                type="button"
                onClick={() => setPhotoEditorOpen(false)}
                className="rounded-full px-3 py-1 text-xs font-semibold text-ink-600 hover:bg-ink-100"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center gap-4">
              <div
                className="relative h-[220px] w-[220px] overflow-hidden rounded-full bg-ink-100"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerLeave={handleCropPointerUp}
                role="presentation"
              >
                <img
                  src={cropImageUrl}
                  alt="Recorte"
                  className="absolute left-1/2 top-1/2 select-none"
                  style={{
                    width: `${cropMetrics.scaledWidth}px`,
                    height: `${cropMetrics.scaledHeight}px`,
                    transform: `translate(-50%, -50%) translate(${cropOffset.x}px, ${cropOffset.y}px)`,
                  }}
                  draggable={false}
                />
              </div>

              <div className="w-full">
                <label className="text-xs font-semibold text-ink-600">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={cropZoom}
                  onChange={(event) => {
                    const nextZoom = Number(event.target.value);
                    setCropZoom(nextZoom);
                  }}
                  className="mt-2 w-full"
                />
              </div>

              <div className="flex w-full items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoEditorOpen(false)}
                  className="flex-1 rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-600"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCropSave}
                  className="flex-1 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
