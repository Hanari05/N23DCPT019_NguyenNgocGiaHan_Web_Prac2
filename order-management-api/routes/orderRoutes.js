const express = require('express');
const mongoose = require('mongoose');
const Order = require('../models/Order');

const router = express.Router();

// GET /api/orders - Lay danh sach don hang, moi nhat truoc.
// Challenge 1: loc trang thai. Challenge 2: sap xep tong tien.
router.get('/', async (req, res) => {
  try {
    const { status, sort } = req.query;
    const allowedStatuses = Order.schema.path('status').enumValues;
    if (status !== undefined && (typeof status !== 'string' || !allowedStatuses.includes(status))) {
      return res.status(400).json({ message: 'status khong hop le' });
    }
    if (sort !== undefined && !['asc', 'desc'].includes(sort)) {
      return res.status(400).json({ message: 'sort phai la asc hoac desc' });
    }
    // Co the ket hop ?status=pending&sort=asc.
    const filter = status === undefined ? {} : { status };
    const sortOptions = sort === undefined
      ? { createdAt: -1, _id: -1 }
      : { totalAmount: sort === 'asc' ? 1 : -1, _id: 1 };
    const orders = await Order.find(filter).sort(sortOptions);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Challenge 3: tim mot phan ten, khong phan biet hoa thuong.
// Dat /search TRUOC /:id de Express khong xem 'search' la ID.
router.get('/search', async (req, res) => {
  const { name } = req.query;
  if (typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Hay truyen name khong rong' });
  }
  // Escape ky tu regex de ten nhu 'An (A)' duoc tim nhu van ban thuong.
  const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  try {
    const orders = await Order.find({
      customerName: { $regex: escapedName, $options: 'i' },
    }).sort({ createdAt: -1, _id: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
