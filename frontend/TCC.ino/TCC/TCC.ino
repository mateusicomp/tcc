#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>  
#include <PubSubClient.h>
WiFiClient espClient;
PubSubClient mqttClient(espClient);


const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

const char* ssid = "wifi-zone-ufam-1";
const char* password = "";

const char* FIREBASE_HOST = "https://firestore.googleapis.com/v1/projects/tcc1-155fa/databases/(default)/documents/sensores";
const char* FIREBASE_API_KEY = "AIzaSyD-3x3bJH3r2n0hyngOOC7_WOuvPBHo_T4";

#define SENSOR_BAIXO_PIN 18
#define SENSOR_MEDIO_PIN 19
#define SENSOR_ALTO_PIN 21
#define BOMBA_ATIVACAO_PIN 22  
#define BOMBA_STATUS_PIN 23    

bool lastStateBaixo = LOW;
bool lastStateMedio = LOW;
bool lastStateAlto = LOW;
String ultimoNivel = "nenhum";  

void setup() {
  Serial.begin(115200);
  
  pinMode(SENSOR_BAIXO_PIN, INPUT_PULLDOWN);
  pinMode(SENSOR_MEDIO_PIN, INPUT_PULLDOWN);
  pinMode(SENSOR_ALTO_PIN, INPUT_PULLDOWN);
  pinMode(BOMBA_ATIVACAO_PIN, OUTPUT);
  pinMode(BOMBA_STATUS_PIN, INPUT_PULLDOWN);

  WiFi.begin(ssid, password);
  Serial.print("Conectando ao WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".!");
  }
  Serial.println("\nConectado ao WiFi!");

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callbackMQTT);
  conectarMQTT();

  // Configura e espera sincronização do tempo
  configTime(-3 * 3600, 0, "pool.ntp.org", "time.nist.gov");
  esperarSyncTime();
}


void loop() {
  mqttClient.loop();
  verificarSensor(SENSOR_BAIXO_PIN, lastStateBaixo, "baixo");
  verificarSensor(SENSOR_MEDIO_PIN, lastStateMedio, "medio");
  verificarSensor(SENSOR_ALTO_PIN, lastStateAlto, "alto");

  delay(500);
}


void conectarMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Conectando ao MQTT...");
    if (mqttClient.connect("esp32_client")) {
      Serial.println("Conectado!");
      mqttClient.subscribe("bomba/controle");
    } else {
      Serial.print(".");
      delay(2000);
    }
  }
}


void callbackMQTT(char* topic, byte* payload, unsigned int length) {
  String mensagem;
  for (int i = 0; i < length; i++) {
    mensagem += (char)payload[i];
  }

  Serial.print("Recebido: ");
  Serial.println(mensagem);

  // Separar nome e comando
  int espaco = mensagem.indexOf(' ');
  if (espaco > 0) {
    String nome = mensagem.substring(0, espaco);
    String comando = mensagem.substring(espaco + 1);

    if (comando == "ligar") {
      ativarBomba();
      enviarComandoFirestore(nome + " ligou");
    } else if (comando == "desligar") {
      desligarBomba();
      enviarComandoFirestore(nome + " desligou");
    }
  }
}


void verificarSensor(int pino, bool &ultimoEstado, const char* nome) {
  bool estadoAtual = digitalRead(pino);

  if (estadoAtual != ultimoEstado) {
    ultimoEstado = estadoAtual;
    String mensagem = estadoAtual ? "subiu" : "desceu";
    
    if (validarSequencia(nome, estadoAtual)) {
      Serial.printf("Sensor, %s: %s\n", nome, mensagem.c_str());
      
      enviarDadosFirestore(nome, mensagem);

      if (digitalRead(SENSOR_BAIXO_PIN) == HIGH && digitalRead(SENSOR_MEDIO_PIN) == LOW) {
        ativarBomba();
      }

      if (strcmp(nome, "alto") == 0 && estadoAtual) {
        desligarBomba();
      }

      if (estadoAtual) {
        ultimoNivel = nome;
      }
    } else {
      Serial.println("Erro: Mudança de nível inválida!");
    }
  }
}


bool validarSequencia(const char* nome, bool subindo) {
  if (subindo) {
    if ((strcmp(nome, "baixo") == 0) || 
        (strcmp(nome, "medio") == 0 && (ultimoNivel == "baixo" || ultimoNivel == "medio")) || 
        (strcmp(nome, "alto") == 0 && ultimoNivel == "medio")) {
      return true;
    }
  } else {
    if ((strcmp(nome, "baixo") == 0) ||
        (strcmp(nome, "medio") == 0 && (ultimoNivel == "alto" || ultimoNivel == "medio")) ||
        (strcmp(nome, "alto") == 0)) {
      return true;
    }
  }
  return false;
}


void ativarBomba() {
  Serial.println("Ativando bomba...");
  digitalWrite(BOMBA_ATIVACAO_PIN, HIGH);
  delay(100);

  unsigned long inicio = millis();
  while (millis() - inicio < 5000) {
    if (digitalRead(BOMBA_STATUS_PIN) == HIGH) {
      Serial.println("Bomba ligada com sucesso!");
      return;
    }
  }
  Serial.println("Erro: Bomba não foi ligada dentro do tempo!");
}


void desligarBomba() {
  Serial.println("Desligando bomba...");
  digitalWrite(BOMBA_ATIVACAO_PIN, LOW);
}


void enviarDadosFirestore(const char* sensor, String estado) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String url = String(FIREBASE_HOST) + "?key=" + FIREBASE_API_KEY;

    String jsonPayload =
      "{ \"fields\": { "
        "\"sensor\": { \"stringValue\": \"" + String(sensor) + "\" }, "
        "\"estado\": { \"stringValue\": \"" + estado + "\" }, "
        "\"timestamp\": { \"timestampValue\": \"" + getISOTime() + "\" } "
      "} }";

    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("Dados enviados! Código HTTP: %d\n", httpResponseCode);
    } else {
      Serial.printf("Erro ao enviar: %s\n",
        http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  } else {
    Serial.println("Erro: WiFi não conectado.");
  }
}


void enviarComandoFirestore(String mensagem) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String url = String(FIREBASE_HOST) + "?key=" + FIREBASE_API_KEY;
    String jsonPayload =
      "{ \"fields\": { "
      "\"bomba\": { \"stringValue\": \"" + mensagem + "\" }, "
      "\"timestamp\": { \"timestampValue\": \"" + getISOTime() + "\" } "
      "} }";

    http.begin(url);
    http.addHeader("Content-Type", "application/json");
  
    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0) {
      Serial.printf("Comando enviado! Código HTTP: %d\n", httpResponseCode);
    } else {
      Serial.printf("Erro ao enviar comando: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
  }
}


String getISOTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "1970-01-01T00:00:00Z";
  }
  char buffer[30];
  strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(buffer);
}

void esperarSyncTime() {
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    Serial.println("Esperando sincronização do tempo...");
    delay(1000);
  }
}