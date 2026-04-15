import { Application } from "../models/Application.js";
import { applicationInputSchema, formatZodIssues } from "../validation/applicationSchema.js";
import { buildPublicFileUrl } from "../utils/publicUrl.js";
import { applicationsToCsv } from "../utils/csv.js";
import { sendApplicationConfirmationEmail } from "../utils/mail.js";

const searchableFields = ["fullName", "rollNo", "collegeName", "city", "email", "domain", "role", "internshipMode", "internshipType"];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilter(query) {
  const filter = {};
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const internshipType = typeof query.internshipType === "string" ? query.internshipType.trim() : "";
  const role = typeof query.role === "string" ? query.role.trim() : "";

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), "i");
    filter.$or = searchableFields.map((field) => ({ [field]: pattern }));
  }

  if (["short", "long"].includes(internshipType)) {
    filter.internshipType = internshipType;
  }

  if (["Training Based", "Work Based"].includes(role)) {
    filter.role = role;
  }

  return filter;
}

export async function createApplication(request, response, next) {
  try {
    const payload = applicationInputSchema.safeParse(request.body);

    if (!payload.success) {
      response.status(400).json({
        message: "Please fix the highlighted fields.",
        errors: formatZodIssues(payload.error)
      });
      return;
    }

    if (!request.file) {
      response.status(400).json({
        message: "Payment receipt is required."
      });
      return;
    }

    const application = await Application.create({
      ...payload.data,
      paymentScreenshot: buildPublicFileUrl(request, request.file.filename)
    });

    // Send confirmation email in the background without blocking the response
    sendApplicationConfirmationEmail({
      to: payload.data.email,
      fullName: payload.data.fullName,
      internshipType: payload.data.internshipType,
      internshipMode: payload.data.internshipMode,
      domain: payload.data.domain,
      role: payload.data.role,
      rollNo: payload.data.rollNo,
      collegeName: payload.data.collegeName,
      city: payload.data.city
    }).catch((mailError) => {
      console.error("Background confirmation email failed:", mailError.message);
    });

    response.status(201).json({
      message: "Application submitted successfully. A confirmation email will be sent to your address shortly.",
      application
    });
  } catch (error) {
    next(error);
  }
}

export async function listApplications(request, response, next) {
  try {
    const page = Math.max(Number.parseInt(request.query.page || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(request.query.limit || "12", 10) || 12, 1), 100);
    const filter = buildFilter(request.query);

    const [applications, filteredTotal, overallTotal, shortCount, longCount, workBasedCount, trainingBasedCount] = await Promise.all([
      Application.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Application.countDocuments(filter),
      Application.countDocuments(),
      Application.countDocuments({ internshipType: "short" }),
      Application.countDocuments({ internshipType: "long" }),
      Application.countDocuments({ role: "Work Based" }),
      Application.countDocuments({ role: "Training Based" })
    ]);

    response.json({
      applications,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        pages: Math.max(Math.ceil(filteredTotal / limit), 1)
      },
      summary: {
        total: overallTotal,
        shortCount,
        longCount,
        workBasedCount,
        trainingBasedCount
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function exportApplications(request, response, next) {
  try {
    const filter = buildFilter(request.query);
    const applications = await Application.find(filter).sort({ createdAt: -1 }).lean();
    const csv = applicationsToCsv(applications);

    response.setHeader("Content-Type", "text/csv; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="internship-applications-${Date.now()}.csv"`);
    response.send(csv);
  } catch (error) {
    next(error);
  }
}

export async function testEmail(request, response) {
  const testEmailAddress = request.query.to || process.env.SMTP_USER;
  
  try {
    console.log(`[Test Email] Manually triggering test to: ${testEmailAddress}`);
    const result = await sendApplicationConfirmationEmail({
      to: testEmailAddress,
      fullName: "Test User",
      internshipType: "short",
      internshipMode: "online",
      domain: "Test Domain",
      role: "Work Based",
      rollNo: "TEST001",
      collegeName: "Test College",
      city: "Test City"
    });
    
    response.json({
      success: !result.skipped,
      driver: result.driver || "none",
      message: result.skipped 
        ? "Email sending was skipped. Check your environment variables." 
        : `Test email sent successfully via ${result.driver} to ${testEmailAddress}. Please check your inbox (including spam).`,
      config: {
        using_resend: !!process.env.RESEND_API_KEY,
        smtp_configured: !!process.env.SMTP_HOST,
        from: process.env.EMAIL_FROM
      }
    });
  } catch (error) {
    console.error(`[Test Email] Failed:`, error.message);
    response.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      details: "Check server logs for full stack trace."
    });
  }
}
