const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── User Schema ────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    targetCriteria: {
      type: Number,
      default: 75,
      min: 50,
      max: 95,
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if modified)
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// ─── Subject Schema ─────────────────────────────────────────────────────────────
const SubjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Lecture', 'Lab'],
      required: true,
    },
    stepWeight: {
      type: Number,
      default: 1,
      enum: [1, 2],
    },
    present: {
      type: Number,
      default: 0,
      min: 0,
    },
    od: {
      type: Number,
      default: 0,
      min: 0,
    },
    makeup: {
      type: Number,
      default: 0,
      min: 0,
    },
    absent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// CO5 Compound Index — one subject code per user
SubjectSchema.index({ userId: 1, code: 1 }, { unique: true });

// Virtual: total hours attended (present + OD + makeup)
SubjectSchema.virtual('attended').get(function () {
  return this.present + this.od + this.makeup;
});

// Virtual: total hours conducted (present + OD + absent)
SubjectSchema.virtual('totalConducted').get(function () {
  return this.present + this.od + this.absent;
});

// Virtual: attendance percentage
SubjectSchema.virtual('percentage').get(function () {
  const totalConducted = this.present + this.od + this.absent;
  if (totalConducted === 0) return 0;
  return parseFloat(((this.attended / totalConducted) * 100).toFixed(2));
});

const User = mongoose.model('User', UserSchema);
const Subject = mongoose.model('Subject', SubjectSchema);

module.exports = { User, Subject };
