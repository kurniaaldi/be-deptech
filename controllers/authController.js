const { Admin } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate, gender } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthDate,
      gender,
    });
    res.json(newAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMe = (req, res) => {
  const { password, ...adminData } = req.admin.toJSON();
  res.json(adminData);
};

exports.updateMe = async (req, res) => {
  const { firstName, lastName, birthDate, gender } = req.body;
  try {
    await req.admin.update({ firstName, lastName, birthDate, gender });
    res.json({ message: "Profile updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Admin.findAndCountAll({
      attributes: { exclude: ["password"] },
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed!", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin Not Found!" });

    await admin.destroy();
    res.json({ message: "Success!" });
  } catch (error) {
    res.status(500).json({ message: "failed", error: error.message });
  }
};
