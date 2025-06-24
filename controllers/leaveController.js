const { Leave, Employee, Sequelize } = require("../models");
const { Op, fn, col, literal } = Sequelize;

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Leave.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
      include: [
        {
          model: Employee,
          as: "Employee",
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
    res.status(500).json({
      message: "Error retrieving leaves",
      error: error.message,
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });
    res.status(200).json(leave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving leave", error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { employeeId, reason, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const year = start.getFullYear();
    const month = start.getMonth() + 1;

    // Validasi 1: maksimal 12 hari dalam setahun
    const total = await Leave.findAll({
      attributes: [
        [literal("SUM(DATEDIFF(endDate, startDate) + 1)"), "totalDays"],
      ],
      where: {
        employeeId,
        startDate: {
          [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)],
        },
      },
      raw: true,
    });

    const totalDays = parseInt(total[0].totalDays || 0);
    if (totalDays + diffDays > 12) {
      return res.status(400).json({ message: "Cuti tahunan melebihi 12 hari" });
    }

    // Validasi 2: hanya boleh 1 kali cuti di bulan yang sama
    const existing = await Leave.findOne({
      where: {
        employeeId,
        [Op.and]: [
          fn("MONTH", col("startDate")),
          month,
          fn("YEAR", col("startDate")),
          year,
        ],
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Sudah mengambil cuti bulan ini" });
    }

    const leave = await Leave.create({
      employeeId,
      reason,
      startDate,
      endDate,
    });
    res.status(201).json(leave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating leave", error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const { employeeId, reason, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const year = start.getFullYear();
    const month = start.getMonth() + 1;

    // Validasi 1: tidak lebih dari 12 hari setahun
    const total = await Leave.findAll({
      attributes: [
        [literal("SUM(DATEDIFF(endDate, startDate) + 1)"), "totalDays"],
      ],
      where: {
        employeeId,
        id: { [Op.ne]: leave.id },
        startDate: {
          [Op.between]: [new Date(`${year}-01-01`), new Date(`${year}-12-31`)],
        },
      },
      raw: true,
    });

    const totalDays = parseInt(total[0].totalDays || 0);
    if (totalDays + diffDays > 12) {
      return res.status(400).json({ message: "Cuti tahunan melebihi 12 hari" });
    }

    // Validasi 2: hanya 1 kali cuti per bulan
    const existing = await Leave.findOne({
      where: {
        employeeId,
        id: { [Op.ne]: leave.id },
        [Op.and]: [
          fn("MONTH", col("startDate")),
          month,
          fn("YEAR", col("startDate")),
          year,
        ],
      },
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Sudah mengambil cuti bulan ini" });
    }

    await leave.update({ employeeId, reason, startDate, endDate });
    res.status(200).json(leave);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating leave", error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    await leave.destroy();
    res.status(200).json({ message: "Leave deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting leave", error: error.message });
  }
};
