
import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema({
  phone: { type: String, default: "" },
  bio: { type: String, default: "" },
  skills: { type: String, default: "" },
  location: { type: String, default: "" },
  portfolioWebsite: { type: String, default: "" },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
  },
  privacy: {
    profileVisible: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    allowMessages: { type: Boolean, default: true },
  },
  preferences: {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "utc" },
    currency: { type: String, default: "usd" },
    theme: { type: String, default: "dark" },
  },
  professionalTitle: { type: String, default: "" },
  titleLocked: { type: Boolean, default: false },
  hourlyRate: { type: Number, default: 0 },
  availableForJobs: { type: Boolean, default: true },
});

const BankSchema = new mongoose.Schema({
  accountNo: String,
  ifsc: String,
  upiId: String,
  holderName: String,
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["freelancer", "client", "pending"], default: "pending" },
    image: { type: String, default: null },
    settings: { type: SettingsSchema, default: () => ({}) },
    bankAccount: { type: BankSchema, default: null }, // Added
    paymentMode: { type: String, enum: ["crypto", "bank", "upi", "card", "both"], default: "bank" }, // Added
    walletAddress: { type: String, default: null },
    walletLinkedAt: { type: Date },
    walletMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
