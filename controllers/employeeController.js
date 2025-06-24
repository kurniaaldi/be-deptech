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

    res
      .json({
        data: rows,
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: page,
          perPage: limit,
        },
        status: "success",
      })
      .status(200);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving employees", error: err.message });
  }
};

exports.getById = async (req, res) =>
  res.json(await Employee.findByPk(req.params.id));

exports.create = async (req, res) => res.json(await Employee.create(req.body));

exports.update = async (req, res) => {
  const emp = await Employee.findByPk(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  await emp.update(req.body);
  res.json(emp);
};

exports.remove = async (req, res) => {
  const emp = await Employee.findByPk(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not found" });
  await emp.destroy();
  res.json({ message: "Deleted" });
};
