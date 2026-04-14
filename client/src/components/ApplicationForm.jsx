import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitApplication } from "../lib/api";
import { BASE_AMOUNT_OVERRIDE, CERTIFICATE_FEE, DOMAIN_OPTIONS, FULL_AMOUNT_OVERRIDE, GST_RATE, INTERNSHIP_DETAILS, INTERNSHIP_MODE_OPTIONS, ROLE_OPTIONS, formatCurrency } from "../lib/options";
import { applicationFormSchema } from "../lib/validation";
import { PaymentSection } from "./PaymentSection";
import { ReceiptPreview } from "./ReceiptPreview";

const defaultValues = {
  fullName: "",
  rollNo: "",
  collegeName: "",
  city: "",
  email: "",
  domain: DOMAIN_OPTIONS[0].value,
  role: ROLE_OPTIONS[0].value,
  internshipMode: "offline",
  internshipType: "short",
  paymentScreenshot: undefined
};
const DRAFT_STORAGE_PREFIX = "internship_portal_form_draft";

const fieldLabelMap = {
  fullName: "Full Name",
  rollNo: "College Roll Number",
  collegeName: "College / University Name",
  city: "City",
  email: "Email Address",
  domain: "Domain",
  role: "Role",
  internshipMode: "Internship Mode",
  internshipType: "Internship Type",
  paymentScreenshot: "Payment Receipt"
};

function FieldError({ error }) {
  if (!error) {
    return null;
  }

  return <p className="field-error">{error.message}</p>;
}

export function ApplicationForm({ internshipType }) {
  const program = INTERNSHIP_DETAILS[internshipType];
  const [amountType, setAmountType] = useState("full");
  const [draftReady, setDraftReady] = useState(false);
  const [paymentOptionsOpen, setPaymentOptionsOpen] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [receiptPreview, setReceiptPreview] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      ...defaultValues,
      internshipType
    }
  });

  const selectedRole = watch("role");
  const selectedMode = watch("internshipMode");
  const fullName = watch("fullName");
  const rollNo = watch("rollNo");
  const collegeName = watch("collegeName");
  const city = watch("city");
  const email = watch("email");
  const selectedDomain = watch("domain");
  const selectedFormRole = watch("role");
  const selectedFormMode = watch("internshipMode");
  const receiptFiles = watch("paymentScreenshot");
  const selectedReceipt = receiptFiles?.[0] || null;
  const computedBaseAmount = selectedMode === "online" ? CERTIFICATE_FEE : program.fee;
  const computedFullAmount = selectedMode === "online" ? CERTIFICATE_FEE : Math.round(program.fee * (1 + GST_RATE));
  const baseAmount = BASE_AMOUNT_OVERRIDE ?? computedBaseAmount;
  const fullAmount = FULL_AMOUNT_OVERRIDE ?? computedFullAmount;
  const payableAmount = amountType === "base" ? baseAmount : fullAmount;
  const invalidFields = Object.entries(errors)
    .map(([field, error]) => ({
      field,
      label: fieldLabelMap[field] || field,
      message: error?.message || "Invalid value"
    }))
    .filter((item) => Boolean(item.message));

  useEffect(() => {
    setValue("internshipType", internshipType, { shouldValidate: true, shouldDirty: true });
  }, [internshipType, setValue]);

  useEffect(() => {
    const draftStorageKey = `${DRAFT_STORAGE_PREFIX}:${internshipType}`;
    const draftText = window.localStorage.getItem(draftStorageKey);

    if (draftText) {
      try {
        const draft = JSON.parse(draftText);
        reset(
          {
            ...defaultValues,
            ...draft,
            internshipType,
            paymentScreenshot: undefined
          },
          {
            keepDefaultValues: true
          }
        );

        if (draft.amountType === "base" || draft.amountType === "full") {
          setAmountType(draft.amountType);
        }
      } catch {
        window.localStorage.removeItem(draftStorageKey);
      }
    }

    setDraftReady(true);
  }, [internshipType, reset]);

  useEffect(() => {
    if (!draftReady) {
      return;
    }

    const draftStorageKey = `${DRAFT_STORAGE_PREFIX}:${internshipType}`;
    const draftPayload = {
      fullName,
      rollNo,
      collegeName,
      city,
      email,
      domain: selectedDomain,
      role: selectedFormRole,
      internshipMode: selectedFormMode,
      internshipType,
      amountType
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
  }, [
    amountType,
    city,
    collegeName,
    draftReady,
    email,
    fullName,
    internshipType,
    rollNo,
    selectedDomain,
    selectedFormMode,
    selectedFormRole
  ]);

  useEffect(() => {
    if (!selectedReceipt) {
      setReceiptPreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(selectedReceipt);
    setReceiptPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedReceipt]);

  async function onSubmit(formValues) {
    setSubmitError("");
    setSubmitMessage("");

    try {
      const uploadedReceipt = formValues.paymentScreenshot?.[0];

      if (!uploadedReceipt) {
        setError("paymentScreenshot", {
          type: "manual",
          message: "Payment receipt is required."
        });
        return;
      }

      const payload = new FormData();
      payload.append("fullName", formValues.fullName);
      payload.append("rollNo", formValues.rollNo);
      payload.append("collegeName", formValues.collegeName);
      payload.append("city", formValues.city);
      payload.append("email", formValues.email);
      payload.append("domain", formValues.domain);
      payload.append("role", formValues.role);
      payload.append("internshipMode", formValues.internshipMode);
      payload.append("internshipType", internshipType);
      payload.append("paymentScreenshot", uploadedReceipt);

      const response = await submitApplication(payload);
      setSubmitMessage(response.message || "Your application has been submitted successfully.");
      setPaymentOptionsOpen(false);
      setAmountType("full");
      window.localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}:${internshipType}`);
      reset({ ...defaultValues, internshipType });
      setFileInputKey((current) => current + 1);
    } catch (error) {
      if (Array.isArray(error?.details) && error.details.length > 0) {
        error.details.forEach((issue) => {
          const fieldName = issue?.field;

          if (fieldName && fieldLabelMap[fieldName]) {
            setError(fieldName, {
              type: "server",
              message: issue.message || "Invalid value"
            });
          }
        });

        setSubmitError("Please fix the highlighted fields.");
        return;
      }

      setSubmitError(error.message || "Submission failed. Please try again.");
    }
  }

  const inputClasses = "field-input";
  const selectClasses = "field-select";

  function handleClearForm() {
    window.localStorage.removeItem(`${DRAFT_STORAGE_PREFIX}:${internshipType}`);
    setSubmitError("");
    setSubmitMessage("");
    setAmountType("full");
    setPaymentOptionsOpen(false);
    reset({ ...defaultValues, internshipType });
    setFileInputKey((current) => current + 1);
  }

  return (
    <div className="card-shell p-5 sm:p-7 lg:p-8 animate-fadeUp">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Application form</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-slate-950">{program.title}</h2>
        </div>
        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-blue-700">Program fee</p>
          <p className="mt-1 text-lg font-semibold text-slate-950">{formatCurrency(payableAmount)}</p>
        </div>
      </div>

      {submitMessage ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {submitMessage}
        </div>
      ) : null}

      {submitError ? (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {invalidFields.length > 0 ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <p className="font-semibold">Please correct these fields:</p>
            <ul className="mt-2 space-y-1">
              {invalidFields.map((item) => (
                <li key={item.field}>
                  {item.label}: {item.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="fullName">
              Full Name
            </label>
            <input id="fullName" type="text" placeholder="Name for certificate" className={inputClasses} required {...register("fullName")} />
            <FieldError error={errors.fullName} />
          </div>

          <div>
            <label className="field-label" htmlFor="rollNo">
              College Roll Number
            </label>
            <input id="rollNo" type="text" placeholder="Roll number" className={inputClasses} required {...register("rollNo")} />
            <FieldError error={errors.rollNo} />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="collegeName">
              College / University Name
            </label>
            <input
              id="collegeName"
              type="text"
              placeholder="Institution name"
              className={inputClasses}
              required
              {...register("collegeName")}
            />
            <FieldError error={errors.collegeName} />
          </div>

          <div>
            <label className="field-label" htmlFor="city">
              City
            </label>
            <input id="city" type="text" placeholder="City" className={inputClasses} required {...register("city")} />
            <FieldError error={errors.city} />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="email">
            Email Address
          </label>
          <input id="email" type="email" placeholder="For confirmation email" className={inputClasses} required {...register("email")} />
          <FieldError error={errors.email} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="internshipMode">
              Internship Mode
            </label>
            <select id="internshipMode" className={selectClasses} required {...register("internshipMode")}>
              {INTERNSHIP_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError error={errors.internshipMode} />
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">
            {selectedMode === "online" ? (
              <>
                Online mode selected. Internship is free and only the certificate fee of {formatCurrency(CERTIFICATE_FEE)} applies.
              </>
            ) : (
              <>
                Offline mode selected. Base amount is {formatCurrency(baseAmount)} and full amount (with GST) is {formatCurrency(fullAmount)}.
              </>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="domain">
              Domain
            </label>
            <select id="domain" className={selectClasses} required {...register("domain")}>
              {DOMAIN_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError error={errors.domain} />
          </div>

          <div>
            <label className="field-label" htmlFor="role">
              Role
            </label>
            <select id="role" className={selectClasses} required {...register("role")}>
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError error={errors.role} />
          </div>
        </div>

        {selectedRole === "Work Based" ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            You will receive an experience letter from the company.
          </div>
        ) : null}

        <PaymentSection
          amount={payableAmount}
          baseAmount={baseAmount}
          fullAmount={fullAmount}
          amountType={amountType}
          onAmountTypeChange={setAmountType}
          internshipTitle={program.title}
          internshipMode={selectedMode}
          isOpen={paymentOptionsOpen}
          onToggle={() => setPaymentOptionsOpen((current) => !current)}
        />

        <div className="space-y-3">
          <div>
            <label className="field-label" htmlFor="paymentScreenshot">
              Upload Payment Receipt
            </label>
            <input
              key={fileInputKey}
              id="paymentScreenshot"
              type="file"
              accept="image/*,application/pdf"
              className="field-input cursor-pointer file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              required
              {...register("paymentScreenshot")}
            />
            <FieldError error={errors.paymentScreenshot} />
          </div>

          <ReceiptPreview file={selectedReceipt} previewUrl={receiptPreview} />
        </div>

        <button type="submit" className="primary-button w-full py-3.5 text-base" disabled={isSubmitting}>
          {isSubmitting ? "Submitting application..." : "Submit Application"}
        </button>

        <button type="button" className="secondary-button w-full py-3.5 text-base" onClick={handleClearForm}>
          Clear Form
        </button>
      </form>
    </div>
  );
}
