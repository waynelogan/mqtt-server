require('dotenv').config(); // Load environment variables from a .env file

const express = require('express');
const mongoose = require('mongoose');
const mqtt = require('mqtt');
const SensorData = require('./models/sensorData');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Set up MQTT client
const mqttClient = mqtt.connect(process.env.MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  mqttClient.subscribe('your/mqtt/topic');
});

mqttClient.on('message', (topic, message) => {
  // Parse the incoming JSON message
  const data = JSON.parse(message.toString());

  // Save data to MongoDB
  const sensorData = new SensorData({
    temperature: data.temperature,
    humidity: data.humidity,
    soilMoisture: data.soilMoisture
  });

  sensorData.save()
    .then(() => {
      console.log('Data saved to MongoDB');
    })
    .catch((error) => {
      console.error('Error saving data to MongoDB:', error);
    });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
