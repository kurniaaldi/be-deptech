const { Employee, Leave } = require("../models");

exports.employeeWithLeaves = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Employee.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
      model: Employee,
      as: "Employee",
      include: [
        {
          model: Leave,
          as: "Leaves",
        },
      ],
    });
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
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
    res
      .status(500)
      .json({ message: "Error retrieving Leaves", error: error.message });
  }
};
