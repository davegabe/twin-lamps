
# Twin Lamps
Open source revisitation of Friendship Lamp (or Long Distance Lamp).  
If you have never heard of them, in short words: this makes two (or more) bulbs, even on different networks, blink at the same time using MQTT.

## What do I need?
You only need two (or even more, if you want) [Shelly](https://shelly.cloud/) bulbs. You don't need any soldering skills as the Shelly web-panel already provides  a good interface for MQTT configuration.  
You also need a [MQTT broker](https://mosquitto.org/) to make the bulbs and the server communicate.

## How does it work?
The bulbs connect to the MQTT broker and subscribe to their topics. Also the server connects to the MQTT broker and publish on those topics.  
The server also provides a web-interface to login and make the lamp blink at different light intensities.

## Configuration .env 
```dosini
WEBSITENAME=Website name
PORT=Website port
LAMPS=Device ID list comma separated (e.g. xxxxx,xxxxx)
LAMPSTYPE=Shelly bulb type list comma separated (e.g. ShellyVintage,ShellyBulbDuo)
MQTT_HOST=MQTT broker address (e.g. test.mosquitto.org)
USER=MQTT broker username (also used for the web-interface)
PASSWORD=MQTT broker password (also used for the web-interface)
```