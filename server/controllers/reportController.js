const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const Property = require('../models/Property');

// POST /api/reports/:propertyId — tenant only, must have a booking for this property
exports.createReport = async (req, res) => {
  try {
    const { reason, description } = req.body;

    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Verify tenant has an approved booking for this property
    const booking = await Transaction.findOne({
      tenantId: req.user._id,
      propertyId: req.params.propertyId,
      transactionType: 'property_booking',
      status: 'approved',
    });
    if (!booking) {
      return res.status(403).json({ message: 'You can only report properties you have booked' });
    }

    // Check already reported
    const existing = await Report.findOne({
      tenantId: req.user._id,
      propertyId: req.params.propertyId,
    });
    if (existing) return res.status(400).json({ message: 'You have already reported this property' });

    const report = await Report.create({
      tenantId: req.user._id,
      landlordId: property.landlordId,
      propertyId: req.params.propertyId,
      reason,
      description,
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reports/check/:propertyId — check if current tenant already reported
exports.checkReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      tenantId: req.user._id,
      propertyId: req.params.propertyId,
    });
    res.json({ hasReported: !!report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reports/check-booked/:propertyId — check if tenant has approved booking
exports.checkBooked = async (req, res) => {
  try {
    const booking = await Transaction.findOne({
      tenantId: req.user._id,
      propertyId: req.params.propertyId,
      transactionType: 'property_booking',
      status: 'approved',
    });
    res.json({ hasBooked: !!booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/reports — admin only
exports.getAllReports = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('tenantId', 'name email')
        .populate('landlordId', 'name email')
        .populate('propertyId', 'title city images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Report.countDocuments(filter),
    ]);

    res.json({ reports, total, pages: Math.ceil(total / Number(limit)), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/reports/:id — admin reviews a report
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
