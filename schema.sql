PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin'
        CHECK (role IN ('admin', 'operator')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shipment_no TEXT NOT NULL UNIQUE,
    supplier_name TEXT NOT NULL,
    material_name TEXT NOT NULL,
    planned_quantity_kg INTEGER
        CHECK (planned_quantity_kg IS NULL OR planned_quantity_kg > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Vehicles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    queue_no INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'onTheWay'
        CHECK (status IN (
            'onTheWay',
            'waiting',
            'calledToScale',
            'scale',
            'unloading',
            'unloadingCompleted',
            'completed'
        )),
    shipment_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    arrived_at TEXT,
    called_at TEXT,
    at_scale_at TEXT,
    unloading_started_at TEXT,
    unloading_completed_at TEXT,
    completed_at TEXT,
    FOREIGN KEY (shipment_id) REFERENCES Shipments(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS VehicleDocuments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    document_type TEXT NOT NULL
        CHECK (document_type IN ('identity_demo', 'registration_demo')),
    image_path TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    UNIQUE (vehicle_id, document_type)
);
CREATE TABLE IF NOT EXISTS WeighingRecords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vehicle_id INTEGER NOT NULL,
    weighing_type TEXT NOT NULL
        CHECK (weighing_type IN ('gross', 'tare')),
    weight_kg INTEGER NOT NULL CHECK (weight_kg > 0),
    recorded_by INTEGER NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    FOREIGN KEY (recorded_by) REFERENCES Users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status
    ON Vehicles(status);

CREATE INDEX IF NOT EXISTS idx_weighing_records_vehicle
    ON WeighingRecords(vehicle_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weighing_records_vehicle_type
    ON WeighingRecords(vehicle_id, weighing_type);
