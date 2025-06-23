const { Employee, Leave } = require("../models");

exports.employeeWithLeaves = async (req, res) => {
  const data = await Employee.findAll({
    model: Employee,
    as: "Employee",
    include: [
      {
        model: Leave,
        as: "Leaves",
      },
    ],
  });
  res.json(data);
};
