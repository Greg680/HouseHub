const express = require("express");
const router = express.Router();
const House = require("../models/houseModel.js");
//didnt imiplement any ENV cause not sure how to use it yet

//create new house
router.post("/houses", async (req, res) => {
  try {
    const { address, eircode, landlord, key } = req.body;
    const newHouse = new House({ address, eircode, landlord, key }); //new isntance
    await newHouse.save();
    res.status(201).json(newHouse); // saves to mongoDB
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get all houses
router.get("/houses", async (req, res) => {
  try {
    const houses = await House.find(); //finds all houses
    res.json(houses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//get house by Key
router.get("/house/:key", async (req, res) => {
  try {
    const house = await House.findOne({ key: req.params.key }); //finds house by key
    if (!house) return res.status(404).json({ message: "House not found" });
    res.json(house); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//update house
router.put("/house/:key", async (req, res) => {
  try {
    const { address, eircode, landlord, key } = req.body;
    const updatedHouse = { address, eircode, landlord, key };  // update object. retrieve data and send updated data
    const house = await House.findOneAndUpdate(// from mongoose doc from dylan
      { key: req.params.key },
      updatedHouse, // replace/update
      { new: true }
    );
    if (!house) return res.status(404).json({ message: "House not found" });
    res.json(house);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//delete house
router.delete("/house/:key", async (req, res) => {
  try {
    const house = await House.findOneAndDelete({ key: req.params.key }); // delete house by key
    if (!house) return res.status(404).json({ message: "House not found" });
    res.json(house);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;