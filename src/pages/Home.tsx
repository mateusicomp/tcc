import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonList, IonText, IonSelect, IonSelectOption
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import NivelCard from '../components/NivelCard'; 
import { enviarComando } from '../services/mqttService'; 
import { carregarUltimoEstado, buscarComFiltros } from '../services/firestoreService';
//import './Home.css';


const Home: React.FC = () => {
  const [nivel, setNivel] = useState("Desconhecido");
  const [sensorEstado, setSensorEstado] = useState("Desconhecido");

  const [sensorFiltro, setSensorFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);

  const [nome, setNome] = useState("");
  const [comando, setComando] = useState<"ligar" | "desligar" | "">("");


  const carregarUltimo = async () => {
    const ultimo = await carregarUltimoEstado();
    if (ultimo) {
      setNivel(ultimo.sensor);
      setSensorEstado(ultimo.estado);
    }
  };


  useEffect(() => {
    carregarUltimo();
  }, []);


  const buscar = async () => {
    const dados = await buscarComFiltros(sensorFiltro, dataInicio, dataFim);
    setResultados(dados);
  };


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Monitoramento de Água</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <NivelCard titulo="Nível da Caixa" valor={nivel || "Desconhecido"} />
        <NivelCard titulo="Estado do Sensor" valor={sensorEstado || "Desconhecido"} />

        <IonItem>
          <IonLabel position="stacked">Filtrar por Sensor</IonLabel>
          <IonSelect value={sensorFiltro} placeholder="Selecione" onIonChange={(e) => setSensorFiltro(e.detail.value)}>
            <IonSelectOption value="baixo">Baixo</IonSelectOption>
            <IonSelectOption value="medio">Médio</IonSelectOption>
            <IonSelectOption value="alto">Alto</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Data Início (AAAA-MM-DD)</IonLabel>
          <IonInput type="date" value={dataInicio} onIonChange={(e) => setDataInicio(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Data Fim (AAAA-MM-DD)</IonLabel>
          <IonInput type="date" value={dataFim} onIonChange={(e) => setDataFim(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" onClick={buscar}>
          Buscar Leituras
        </IonButton>

        <IonItem>
          <IonInput
            label="Nome"
            placeholder="Digite seu nome"
            value={nome}
            onIonChange={(e) => setNome(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonSelect
            label="Comando"
            value={comando}
            onIonChange={(e) => setComando(e.detail.value)}
          >
            <IonSelectOption value="ligar">Ligar</IonSelectOption>
            <IonSelectOption value="desligar">Desligar</IonSelectOption>
          </IonSelect>
        </IonItem>
        

        <IonButton
          expand="full"
          onClick={() => {
            if (nome && comando) {
              enviarComando(nome, comando);
            }
          }}
        >
          Enviar comando
        </IonButton>


        <IonList>
          {resultados.map((item) => (
            <IonItem key={item.id}>
              <IonText>
                <p><strong>Sensor:</strong> {item.sensor}</p>
                <p><strong>Estado:</strong> {item.estado}</p>
                <p><strong>Timestamp:</strong> {item.timestamp}</p>
              </IonText>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
