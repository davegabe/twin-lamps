import express from "express";
import sha256 from "crypto-js/sha256";
import MqttHandler from "../mqtt_handler";
const router = express.Router();

/** List of ids of bulbs from env */
const lampsIds = process.env.LAMPS.split(",");
/** List of types of bulbs from env */
const lampsType = process.env.LAMPSTYPE.split(",");
/** List of MQTT clients for every bulb */
const mqttClients = [] as MqttHandler[];
for (let i = 0; i < lampsIds.length; i++) {
    mqttClients.push(new MqttHandler(lampsType[i], lampsIds[i]));
    mqttClients[i].connect();
}

/** Token corresponding to user and password (easy auth) */
const authToken = sha256(process.env.USERN + process.env.PASSWORD).toString();

// POST blink lamp (button pressed)
router.post("/", (req, res) => {
    if (req.cookies.token !== authToken) {
        res.json({ success: false });
    } else {
        const { brightness } = req.body as { brightness: string; };
        for (let i = 0; i < mqttClients.length; i++) {
            mqttClients[i].blink(parseInt(brightness));
        }
        res.json({ success: true });
    }
});

export default router;