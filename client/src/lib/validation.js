import { z } from "zod";
import { DOMAIN_OPTIONS, INTERNSHIP_MODE_OPTIONS, ROLE_OPTIONS } from "./options";

const domainValues = DOMAIN_OPTIONS.map((option) => option.value);
const modeValues = INTERNSHIP_MODE_OPTIONS.map((option) => option.value);
const roleValues = ROLE_OPTIONS.map((option) => option.value);
const lettersAndSpacesPattern = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
const rollNumberPattern = /^[A-Za-z0-9/-]+$/;
const receiptSchema =
  typeof FileList !== "undefined"
    ? z.instanceof(FileList).refine((fileList) => fileList.length > 0, {
        message: "Payment receipt is required."
      })
    : z.any();

export const applicationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name is required.")
    .max(120, "Full name is too long.")
    .regex(lettersAndSpacesPattern, "Full name should contain only letters and spaces."),
  rollNo: z
    .string()
    .trim()
    .min(2, "College roll number is required.")
    .max(40, "Roll number is too long.")
    .regex(rollNumberPattern, "Roll number can only contain letters, numbers, '/' and '-'."),
  collegeName: z
    .string()
    .trim()
    .min(2, "College or university name is required.")
    .max(160, "College name is too long.")
    .regex(lettersAndSpacesPattern, "College name should contain only letters and spaces."),
  city: z
    .string()
    .trim()
    .min(2, "City is required.")
    .max(80, "City name is too long.")
    .regex(lettersAndSpacesPattern, "City should contain only letters and spaces."),
  email: z.string().trim().email("Enter a valid email address.").max(160, "Email is too long."),
  domain: z.enum(domainValues, {
    required_error: "Please select a domain."
  }),
  role: z.enum(roleValues, {
    required_error: "Please select a role."
  }),
  internshipMode: z.enum(modeValues, {
    required_error: "Please select an internship mode."
  }),
  internshipType: z.enum(["short", "long"], {
    required_error: "Please select an internship type."
  }),
  paymentScreenshot: receiptSchema
});
