const { Employee } = require("../models");

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Employee.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving employees",
      error: err.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });
    return res.status(200).json(emp);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving employee", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const emp = await Employee.create(req.body);
    return res.status(201).json(emp);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating employee", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    await emp.update(req.body);
    return res.status(200).json(emp);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating employee", error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ message: "Employee not found" });

    await emp.destroy();
    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting employee", error: err.message });
  }
};
