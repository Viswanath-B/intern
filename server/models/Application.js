import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40
    },
    collegeName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20
    },
    domain: {
      type: String,
      required: true,
      enum: ["Full Stack with AI", "Embedded Systems with IoT"]
    },
    role: {
      type: String,
      required: true,
      enum: ["Training Based", "Work Based"]
    },
    internshipMode: {
      type: String,
      required: true,
      enum: ["online", "offline"]
    },
    internshipType: {
      type: String,
      required: true,
      enum: ["short", "long"]
    },
    paymentScreenshot: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  {
    bufferCommands: false,
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

applicationSchema.index({ internshipType: 1, createdAt: -1 });

export const Application = mongoose.model("Application", applicationSchema);
