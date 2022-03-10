import mqtt, { MqttClient } from "mqtt";
type JSONPayloadType = {
  modeVal?: string,
  redVal?: number,
  greenVal?: number,
  blueVal?: number,
  gainVal?: number,
  brightnessVal?: number,
  whiteVal?: number,
  tempVal?: number,
  effectVal?: number,
  turnVal?: string,
  transitionVal?: number;
};

class MqttHandler {
  /** MQTT client reference */
  mqttClient: MqttClient;
  /** Address of MQTT broker */
  host: string;
  /** Username for MQTT broker */
  username: string;
  /** Password for MQTT broker */
  password: string;
  /** Shelly bulb name (e.g. {@link https://shelly-api-docs.shelly.cloud/gen1/#shelly-vintage-mqtt "ShellyVintage"}, {@link https://shelly-api-docs.shelly.cloud/gen1/#shelly-duo-mqtt "ShellyBulbDuo"}, etc.) */
  shellyType: string;
  /** Device ID (found on bulb web panel) */
  id: string;
  /** Count of consecutive "on" status messages received */
  countStateOn: number;

  /**
   * Create MQTT client for the bulb
   * @param shellyType Shelly bulb name (e.g. {@link https://shelly-api-docs.shelly.cloud/gen1/#shelly-vintage-mqtt "ShellyVintage"}, {@link https://shelly-api-docs.shelly.cloud/gen1/#shelly-duo-mqtt "ShellyBulbDuo"}, etc.)
   * @param id Device ID (found on bulb web panel)
   */
  constructor(shellyType: string, id: string) {
    this.mqttClient = null;
    this.host = "mqtt://" + process.env.MQTT_HOST;
    this.username = process.env.USER; // mqtt credentials if these are needed to connect
    this.password = process.env.PASSWORD;
    this.id = id;
    this.shellyType = shellyType;
    this.countStateOn = 0;
  }

  connect() {
    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });

    // Mqtt error calback
    this.mqttClient.on("error", (err: any) => {
      console.log(err);
      this.mqttClient.end();
      this.connect();
    });

    // Subscribe to the status of the light
    this.mqttClient.subscribe(`shellies/${this.shellyType}-${this.id}/light/0`, { qos: 2 });

    // When a message arrives, handle it
    this.mqttClient.on("message", (topic: any, message: { toString: () => string; }) => {
      // console.log(this.countStateOn, message.toString());
      if (message.toString() === "on") {
        this.countStateOn++;
        if (this.countStateOn > 4) { //if the bulb is on for too much time, turn it off
          this.mqttClient.publish(`shellies/${this.shellyType}-${this.id}/light/0/command`, "off", { qos: 2 }, () => { });
        }
      } else {
        this.countStateOn = 0;
      }
    });
  }

  /** Make the bulb blink */
  blink(brightness: number) {
    if (brightness === undefined || brightness === null || brightness === NaN) brightness = 50;
    brightness = Math.max(Math.min(brightness, 100), 1);
    this.mqttClient.publish(`shellies/${this.shellyType}-${this.id}/light/0/set`, this.getJSONPayload({ brightnessVal: brightness }), { qos: 2 }, (err: any) => {
      if (err) return;
      setTimeout(() => {
        this.mqttClient.publish(`shellies/${this.shellyType}-${this.id}/light/0/command`, "off", { qos: 2 }, () => { });
      }, 800);
    });
  }

  /** Get the JSON payload for the '/set' topic with custom parameters valid for various bulbs */
  getJSONPayload({ modeVal, redVal, greenVal, blueVal, gainVal, brightnessVal, whiteVal, tempVal, effectVal, turnVal, transitionVal }: JSONPayloadType): string {
    return JSON.stringify({
      mode: modeVal || "color",           /* "color" or "white" */
      red: redVal || 0,                   /* red brightness, 0..255, applies in mode="color" */
      green: greenVal || 0,               /* green brightness, 0..255, applies in mode="color" */
      blue: blueVal || 255,               /* blue brightness, 0..255, applies in mode="color" */
      gain: gainVal || 100,               /* gain for all channels, 0..100, applies in mode="color" */
      brightness: brightnessVal || 100,   /* brightness, 0..100, applies in mode="white" */
      white: whiteVal || 0,               /* white brightness, 0..255, applies in mode="color" */
      temp: tempVal || 4750,              /* color temperature in K, 3000..6500, applies in mode="white" */
      effect: effectVal || 0,             /* applies an effect when set */
      turn: turnVal || "on",              /* "on", "off" or "toggle" */
      transition: transitionVal || 500    /* One-shot transition, 0..5000 [ms] */
    });
  }
}

export default MqttHandler;
