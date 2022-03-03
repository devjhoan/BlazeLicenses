const client = require("../index");
const ms = require("ms");

client.on("ready", async () => {
    if (client.config.ACTIVITY.ENABLED) {
        let pos = 0;
        async function nextStatus() {
            let status;
            if (pos > client.config.ACTIVITY.ACTIVITIES.length - 1) pos = 0;
            status = client.config.ACTIVITY.ACTIVITIES[pos];
            pos++;
            if (Array.isArray(status)) {
                client.user.setPresence({activities: [{ name: status[1], type: status[0] }]});
            } else client.user.setPresence(status);
        }
        nextStatus();
        setInterval(nextStatus, ms(client.config.ACTIVITY.INTERVAL))
    }
});