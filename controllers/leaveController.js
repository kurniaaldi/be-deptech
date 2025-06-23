const { Leave, Employee, Sequelize } = require("../models");
const { Op, fn, col, literal } = Sequelize;

exports.getAll = async (req, res) => {
  const leaves = await Leave.findAll({
    model: Employee,
    as: "Employee",
  });
  res.json(leaves);
};

exports.create = async (req, res) => {
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

  // Validasi 2: hanya boleh 1 hari di bulan yang sama
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
    return res.status(400).json({ message: "Sudah mengambil cuti bulan ini" });
  }

  // Simpan data cuti
  const leave = await Leave.create({ employeeId, reason, startDate, endDate });
  res.json(leave);
};

// Update, getById, delete: mirip dengan pegawai
