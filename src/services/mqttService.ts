import mqtt from "mqtt";


const options = {
  connectTimeout: 4000,
  clientId: 'ionic_client_' + Math.random().toString(16).substr(2, 8),
  username: '', 
  password: '', 
};
const connectUrl = 'wss://broker.hivemq.com:8884/mqtt';
const client = mqtt.connect(connectUrl, options);


client.on("connect", () => {
  console.log("Conectado ao MQTT");

  client.subscribe("bomba/estado", (err) => {
    if (!err) {
      console.log("Assinou bomba/estado");
    }
  });
});


client.on("message", (topic, message) => {
  console.log(`Mensagem recebida em ${topic}: ${message.toString()}`);
});


export const enviarComando = (nome: string, comando: "ligar" | "desligar") => {
  if (client.connected) {
    const payload = `${nome} ${comando}`;
    client.publish("bomba/controle", payload);
    console.log(`Publicado: ${payload}`);
  } else {
    console.warn("MQTT não conectado!");
  }
};

export default client;