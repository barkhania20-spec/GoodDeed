
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    skills: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    experience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    availability: {
      type: String,
      required: true,
      enum: ["Weekdays", "Weekends", "Both", "Flexible"],
    },
    preferredTime: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon", "Evening", "Anytime"],
    },
    motivation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

applicationSchema.index(
  { user: 1, opportunity: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);
