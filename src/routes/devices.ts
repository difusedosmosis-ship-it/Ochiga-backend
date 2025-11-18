// src/routes/devices.ts
import express from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/roles";
import { Client as SSDPClient } from "node-ssdp";
import mqtt from "mqtt";
import { supabaseAdmin } from "../supabase/client"; // make sure this exists

const router = express.Router();

/** GET /devices/discover - discover real IoT devices on local network */
router.get("/discover", requireAuth, async (req, res) => {
  const discoveredDevices: any[] = [];

  try {
    // --------- SSDP / UPnP discovery (Smart TVs, IR Hubs) ---------
    const ssdp = new SSDPClient({ explicitSocketBind: true });

    ssdp.on("response", (headers, statusCode, rinfo) => {
      discoveredDevices.push({
        id: headers.USN || rinfo.address,
        name: headers.SERVER || "Unknown Device",
        protocol: "ssdp",
        ip: rinfo.address,
        port: rinfo.port,
      });
    });

    ssdp.search("ssdp:all");

    // Wait 5 seconds for SSDP responses
    await new Promise((resolve) => setTimeout(resolve, 5000));
    ssdp.stop();

    // --------- MQTT discovery (Smart switches, Zigbee gateways, etc) ---------
    const mqttClient = mqtt.connect("mqtt://localhost:1883"); // replace with your broker
    await new Promise<void>((resolve, reject) => {
      mqttClient.on("connect", () => {
        mqttClient.subscribe("ochiga/+/device/+/announce", { qos: 1 }, (err) => {
          if (err) reject(err);
        });
      });

      mqttClient.on("message", (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          discoveredDevices.push({
            id: data.id,
            name: data.name,
            protocol: "mqtt",
            ...data,
          });
        } catch (err) {
          console.warn("Failed to parse MQTT message", err);
        }
      });

      // Wait 5 seconds then end MQTT
      setTimeout(() => {
        mqttClient.end(true);
        resolve();
      }, 5000);
    });

    if (discoveredDevices.length === 0) {
      return res.status(404).json({ message: "No devices found" });
    }

    res.json({ devices: discoveredDevices });
  } catch (err: any) {
    console.error("Device discovery error:", err);
    res.status(500).json({ error: "Device discovery failed", details: err.message });
  }
});

/** GET /devices - list devices */
router.get("/", requireAuth, async (req, res) => {
  const estateId = req.query.estateId as string | undefined;
  try {
    const { data, error } = estateId
      ? await supabaseAdmin.from("devices").select("*").eq("estate_id", estateId)
      : await supabaseAdmin.from("devices").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /devices - create device (estate role) */
router.post("/", requireAuth, requireRole("estate"), async (req, res) => {
  const { estate_id, name, type, metadata } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from("devices")
      .insert([{ estate_id, name, type, metadata }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /devices/:id/action - trigger a device action */
router.post("/:id/action", requireAuth, async (req, res) => {
  const id = req.params.id;
  const { action, params } = req.body;
  console.log("Trigger device", id, action, params);
  res.json({ ok: true, message: `Action ${action} queued for device ${id}` });
});

export default router;
