const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');

const router = express.Router();

// GET /api/orders - Lay danh sach don hang, moi nhat truoc.
// Bai tap tu lam: loc theo req.query.status va sap xep theo req.query.sort.
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bai tap tu lam: them GET /search?name=... tai day, TRUOC /:id.

// GET /api/orders/:id - Lay mot don hang.
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID don hang khong hop le' });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Khong tim thay don hang' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders - Tao don hang moi.
router.post('/', async (req, res) => {
  try {
    const order = new Order({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
    });
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/orders/:id - Cap nhat don hang theo lab (body vi du: { "status": "confirmed" }).
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID don hang khong hop le' });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedOrder) return res.status(404).json({ message: 'Khong tim thay don hang' });
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/orders/:id - Xoa don hang.
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'ID don hang khong hop le' });
  }

  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: 'Khong tim thay don hang' });
    res.json({ message: 'Da xoa don hang thanh cong!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
