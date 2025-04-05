const Room = require('../models/room');

const addRoom = async (req, res) => {
  try {
    const { name, image, status } = req.body;
    const newRoom = new Room({ name, image, status });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRoom = await Room.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'ไม่พบห้องที่ต้องการลบ' });
    }
    res.status(200).json({ message: 'ลบห้องสำเร็จ', room: deletedRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addRoom,
  deleteRoom,
};
