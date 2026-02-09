
class MockMQTTClient {
    callback: (event: any) => void;
    constructor(callback: (event: any) => void) {
        this.callback = callback;
    }

    emit(event: any) {
        this.callback(event);
    }
}

class MockClient {
    onEventCallback: ((err: any, event: any) => void) | null = null;
    mqtt: MockMQTTClient | null = null;

    startListening() {
        this.mqtt = new MockMQTTClient((event) => {
            if (this.onEventCallback) {
                if (event.type === 'mqtt_error') {
                    this.onEventCallback(event.error, null);
                } else {
                    this.onEventCallback(null, event);
                }
            }
        });
    }

    listenMqtt(callback: (err: any, event: any) => void) {
        this.onEventCallback = callback;
        if (!this.mqtt) {
            this.startListening();
        }
    }
}

const client = new MockClient();
client.listenMqtt((err, event) => {
    if (err) {
        console.error('ERROR: Listen error -', err);
    } else {
        console.log('Event received:', event);
    }
});

// Simulate event
console.log('Simulating typ event...');
client.mqtt?.emit({ type: 'typ', data: { foo: 'bar' } });

// Simulate error
console.log('Simulating error event...');
client.mqtt?.emit({ type: 'mqtt_error', error: new Error('Fake error') });
