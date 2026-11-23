const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Application = require("./models/Application");
const Opportunity = require("./models/Opportunity");
const User = require("./models/User");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Generate JWT token
const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

// Authentication middleware
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in.",
      });
    }

    const decoded = jwt.verify(
      header.split(" ")[1],
      process.env.JWT_SECRET
    );

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Admin authorization middleware
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
  }

  next();
};

const adminProtect = [protect, adminOnly];

// Create initial admin account using private environment variables
async function ensureAdminAccount() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn(
      "Admin not configured. Add ADMIN_EMAIL and ADMIN_PASSWORD to .env"
    );
    return;
  }

  if (ADMIN_PASSWORD.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be at least 12 characters long."
    );
  }

  const email = ADMIN_EMAIL.toLowerCase().trim();

  let admin = await User.findOne({ email });

  if (!admin) {
    const password = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: ADMIN_NAME || "GoodDeed Admin",
      email,
      password,
      role: "admin",
    });

    console.log("Admin account created successfully!");
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();

    console.log("Existing account promoted to admin.");
  }
}

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to GoodDeed API!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "GoodDeed API is running",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// ---------------- AUTHENTICATION ----------------

// Volunteer registration
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "volunteer",
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
});

// Volunteer login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter email and password.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.role !== "volunteer") {
      return res.status(403).json({
        success: false,
        message: "Please use administrator login.",
      });
    }

    res.json({
      success: true,
      message: "Login successful!",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
});

// Separate admin login
app.post("/api/auth/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter administrator email and password.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "admin",
    });

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    res.json({
      success: true,
      message: "Administrator login successful.",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    res.status(500).json({
      success: false,
      message: "Administrator login failed.",
    });
  }
});

// Get logged-in user
app.get("/api/auth/me", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ---------------- OPPORTUNITIES ----------------

// Get all opportunities (public)
app.get("/api/opportunities", async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: opportunities.length,
      data: opportunities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch opportunities.",
    });
  }
});

// Get single opportunity (public)
app.get("/api/opportunities/:id", async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    res.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid opportunity ID.",
    });
  }
});

// ---------------- VOLUNTEER APPLICATIONS ----------------

// Submit application
app.post("/api/applications", protect, async (req, res) => {
  try {
    const { opportunityId, message } = req.body;

    if (!opportunityId) {
      return res.status(400).json({
        success: false,
        message: "Please select an opportunity.",
      });
    }

    if (message && message.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 500 characters.",
      });
    }

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found.",
      });
    }

    const application = await Application.create({
      user: req.user._id,
      opportunity: opportunityId,
      message: message || "",
    });

    res.status(201).json({
      success: true,
      message: "Your application was submitted!",
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this opportunity.",
      });
    }

    console.error("Application error:", error);

    res.status(500).json({
      success: false,
      message: "Could not submit your application.",
    });
  }
});

// Get my applications
app.get("/api/applications/my", protect, async (req, res) => {
  try {
    const applications = await Application.find({
      user: req.user._id,
    })
      .populate("opportunity")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch your applications.",
    });
  }
});

// Get one of my applications
app.get("/api/applications/:id", protect, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("opportunity");

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    res.json({
      success: true,
      data: application,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid application ID.",
    });
  }
});

// ---------------- ADMIN DASHBOARD ----------------

// Dashboard statistics
app.get("/api/admin/dashboard", ...adminProtect, async (req, res) => {
  try {
    const [
      volunteers,
      opportunities,
      applications,
      pending,
      approved,
      rejected,
    ] = await Promise.all([
      User.countDocuments({ role: "volunteer" }),
      Opportunity.countDocuments(),
      Application.countDocuments(),
      Application.countDocuments({ status: "Pending" }),
      Application.countDocuments({ status: "Approved" }),
      Application.countDocuments({ status: "Rejected" }),
    ]);

    res.json({
      success: true,
      stats: {
        volunteers,
        opportunities,
        applications,
        pending,
        approved,
        rejected,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not load dashboard statistics.",
    });
  }
});

// View all applications
app.get("/api/admin/applications", ...adminProtect, async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("user", "name email")
      .populate(
        "opportunity",
        "title organization category location date"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch applications.",
    });
  }
});

// Approve or reject application
app.patch(
  "/api/admin/applications/:id/status",
  ...adminProtect,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["Pending", "Approved", "Rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status.",
        });
      }

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      )
        .populate("user", "name email")
        .populate("opportunity", "title organization");

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

      res.json({
        success: true,
        message: `Application ${status.toLowerCase()}.`,
        data: application,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Could not update application status.",
      });
    }
  }
);

// View all volunteers
app.get("/api/admin/volunteers", ...adminProtect, async (req, res) => {
  try {
    const volunteers = await User.find({
      role: "volunteer",
    })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: volunteers.length,
      data: volunteers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Could not fetch volunteers.",
    });
  }
});

// Add new opportunity
app.post(
  "/api/admin/opportunities",
  ...adminProtect,
  async (req, res) => {
    try {
      const {
        title,
        organization,
        category,
        location,
        date,
        description,
      } = req.body;

      const fields = [
        title,
        organization,
        category,
        location,
        date,
        description,
      ];

      if (
        !fields.every(
          (value) =>
            typeof value === "string" && value.trim()
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide all opportunity fields.",
        });
      }

      const opportunity = await Opportunity.create({
        title: title.trim(),
        organization: organization.trim(),
        category: category.trim(),
        location: location.trim(),
        date: date.trim(),
        description: description.trim(),
      });

      res.status(201).json({
        success: true,
        message: "Opportunity created.",
        data: opportunity,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Could not create opportunity.",
      });
    }
  }
);

// Edit opportunity
app.put(
  "/api/admin/opportunities/:id",
  ...adminProtect,
  async (req, res) => {
    try {
      const allowedFields = [
        "title",
        "organization",
        "category",
        "location",
        "date",
        "description",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (
          typeof req.body[field] === "string" &&
          req.body[field].trim()
        ) {
          updates[field] = req.body[field].trim();
        }
      }

      const opportunity = await Opportunity.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found.",
        });
      }

      res.json({
        success: true,
        message: "Opportunity updated.",
        data: opportunity,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Could not update opportunity.",
      });
    }
  }
);

// Delete opportunity
app.delete(
  "/api/admin/opportunities/:id",
  ...adminProtect,
  async (req, res) => {
    try {
      const opportunity = await Opportunity.findByIdAndDelete(
        req.params.id
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found.",
        });
      }

      res.json({
        success: true,
        message: "Opportunity deleted.",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Could not delete opportunity.",
      });
    }
  }
);

// ---------------- DATABASE CONNECTION ----------------

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully!");

    await ensureAdminAccount();

    app.listen(PORT, () => {
      console.log(`GoodDeed server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });