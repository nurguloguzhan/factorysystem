const express = require("express");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const app = express();
const databasePath = path.join(__dirname, "data", "factory-system.sqlite");
const database = new DatabaseSync(databasePath);

database.exec("PRAGMA foreign_keys = ON");
app.use(express.json());

app.get("/api/health", (_request, response) => {
  const tables = database
    .prepare(
      `SELECT name
       FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
       ORDER BY name`
    )
    .all()
    .map((row) => row.name);

  response.json({ status: "ok", tables });
});
app.get("/api/vehicles", (_request, response) => {
  const vehicles = database
    .prepare(
      `SELECT
         Vehicles.id,
         Vehicles.plate,
         Vehicles.driver_name AS driver,
         Vehicles.queue_no AS queueNo,
         Vehicles.status,
         Shipments.shipment_no AS shipmentNo,
         Shipments.supplier_name AS supplier,
         Shipments.material_name AS material,
         Shipments.planned_quantity_kg AS plannedQuantityKg
       FROM Vehicles
       JOIN Shipments ON Shipments.id = Vehicles.shipment_id
       ORDER BY Vehicles.queue_no`
    )
    .all();

  response.json({ vehicles });
});
app.get("/api/vehicles", (_request, response) => {
  const vehicles = database
    .prepare(
      `SELECT
         Vehicles.id,
         Vehicles.plate,
         Vehicles.driver_name AS driver,
         Vehicles.queue_no AS queueNo,
         Vehicles.status,
         Shipments.shipment_no AS shipmentNo,
         Shipments.supplier_name AS supplier,
         Shipments.material_name AS material,
         Shipments.planned_quantity_kg AS plannedQuantityKg
       FROM Vehicles
       JOIN Shipments ON Shipments.id = Vehicles.shipment_id
       ORDER BY Vehicles.queue_no`
    )
    .all();

  response.json({ vehicles });
});
app.get("/", (_request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});
app.get("/styles.css", (_request, response) => {
  response.sendFile(path.join(__dirname, "styles.css"));
});
app.get("/app.js", (_request, response) => {
  response.sendFile(path.join(__dirname, "app.js"));
});
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.listen(3000, "127.0.0.1", () => {
  console.log("Sunucu hazır: http://127.0.0.1:3000");
});