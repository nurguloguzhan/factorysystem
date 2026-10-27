const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const projectRoot = path.resolve(__dirname, "..");
const dataDirectory = path.join(projectRoot, "data");
const databasePath = path.join(dataDirectory, "factory-system.sqlite");
const schemaPath = path.join(projectRoot, "schema.sql");

fs.mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(databasePath);

try {
  const schema = fs.readFileSync(schemaPath, "utf8");
  database.exec(schema);

  const vehicleColumns = new Set(
    database.prepare("PRAGMA table_info(Vehicles)").all().map((row) => row.name)
  );
  const timestampColumns = [
    ["arrived_at", "TEXT"],
    ["called_at", "TEXT"],
    ["at_scale_at", "TEXT"],
    ["unloading_started_at", "TEXT"],
    ["unloading_completed_at", "TEXT"],
    ["completed_at", "TEXT"]
  ];

  for (const [columnName, columnType] of timestampColumns) {
    if (!vehicleColumns.has(columnName)) {
      database.exec(`ALTER TABLE Vehicles ADD COLUMN ${columnName} ${columnType}`);
    }
  }

  const vehicleCount = database.prepare("SELECT COUNT(*) AS count FROM Vehicles").get().count;
  const shipmentCount = database.prepare("SELECT COUNT(*) AS count FROM Shipments").get().count;
  const userCount = database.prepare("SELECT COUNT(*) AS count FROM Users").get().count;
  if (vehicleCount === 0 && shipmentCount === 0 && userCount === 0) {
    const insertShipment = database.prepare(
      `INSERT INTO Shipments (shipment_no, supplier_name, material_name, planned_quantity_kg)
       VALUES (?, ?, ?, ?)`
    );
    const insertVehicle = database.prepare(
      `INSERT INTO Vehicles (plate, driver_name, queue_no, status, shipment_id)
       VALUES (?, ?, ?, ?, ?)`
    );

    const sampleVehicles = [
      ["34 ABC 123", "Kadir Yılmaz", "SH-2026-0841", "Polat Gıda", "Çimento", 60000],
      ["06 DEF 456", "Mehmet Arslan", "SH-2026-0842", "Köseoğlu Madencilik", "Kırma taş", 34000],
      ["16 GHI 789", "Salih Çelik", "SH-2026-0843", "Marmara Çimento", "Kum", 48000],
      ["23 JKL 012", "Bora Akgül", "SH-2026-0844", "Ege Döküm", "Çakıl", 52000],
      ["41 MNO 345", "Hakan Demir", "SH-2026-0845", "Deniz Madencilik", "Kum", 41000],
      ["58 PQR 678", "Emre Uçar", "SH-2026-0846", "Yıldız Agrega", "Çimento", 64000]
    ];

    database.exec("BEGIN");
    try {
      sampleVehicles.forEach(([plate, driver, shipmentNo, supplier, material, quantity], index) => {
        insertShipment.run(shipmentNo, supplier, material, quantity);
        const shipmentId = database.prepare("SELECT last_insert_rowid() AS id").get().id;
        insertVehicle.run(plate, driver, index + 1, "waiting", shipmentId);
      });
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }

  const tables = database
    .prepare(
      `SELECT name
       FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
       ORDER BY name`
    )
    .all()
    .map((row) => row.name);

  console.log(`SQLite veritabanı hazır: ${databasePath}`);
  console.log(`Oluşturulan tablolar: ${tables.join(", ")}`);
} finally {
  database.close();
}
