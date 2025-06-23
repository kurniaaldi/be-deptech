const { Employee, Leave } = require("../models");

exports.employeeWithLeaves = async (req, res) => {
  const data = await Employee.findAll({ include: Leave });
  res.json(data);
};
