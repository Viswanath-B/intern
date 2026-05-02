function escapeCsvValue(value) {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function applicationsToCsv(applications) {
  const headers = [
    "Full Name",
    "Roll No",
    "College Name",
    "City",
    "Mobile Number",
    "Mode",
    "Domain",
    "Role",
    "Internship Type",
    "Payment Screenshot",
    "Created At"
  ];

  const rows = applications.map((application) => [
    application.fullName,
    application.rollNo,
    application.collegeName,
    application.city,
    application.mobileNumber,
    application.internshipMode,
    application.domain,
    application.role,
    application.internshipType,
    application.paymentScreenshot,
    application.createdAt ? new Date(application.createdAt).toISOString() : ""
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
}
