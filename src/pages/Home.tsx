import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent,
  IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonBadge, IonIcon, IonList, IonInput, IonSelect, IonSelectOption,
  IonDatetime, IonAccordion, IonAccordionGroup, IonSkeletonText, IonToast, IonFab,
  IonFabButton, IonSegment, IonSegmentButton, IonNote
} from '@ionic/react';
import { refresh, water, alertCircle, funnel, send, time } from 'ionicons/icons';
import React, { useEffect, useMemo, useState } from 'react';
import styles from './Home.module.css';
import NivelCard from '../components/NivelCard';

import client, { enviarComando } from '../services/mqttService';
import { carregarUltimoEstado, buscarComFiltros } from '../services/firestoreService';

type Comando = 'ligar' | 'desligar' | '';

const Home: React.FC = () => {

  const [nivel, setNivel] = useState<string>('Desconhecido');
  const [sensorEstado, setSensorEstado] = useState<string>('Desconhecido');

  const [sensorFiltro, setSensorFiltro] = useState<string>('');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');

  const [resultados, setResultados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [tab, setTab] = useState<'visao' | 'historico'>('visao');

  const [nome, setNome] = useState<string>('');
  const [comando, setComando] = useState<Comando>('');


  const [toastMsg, setToastMsg] = useState<string>('');
  const showToast = (msg: string) => setToastMsg(msg);

  const carregarUltimo = async () => {
    try {
      setCarregando(true);
      const ultimo = await carregarUltimoEstado();
      if (ultimo && ultimo.length) {
        const recente = ultimo[0];
        setNivel(recente?.nivel ?? 'Desconhecido');
        setSensorEstado(recente?.estado ?? 'Desconhecido');
        setResultados(ultimo.slice(0, 20));
      }
    } catch (e) {
      showToast('Falha ao carregar último estado.');
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarUltimo();
  }, []);

  useEffect(() => {
    const handleMessage = (topic: string, payload: Buffer) => {
      const msg = payload.toString();

      if (topic === 'bomba/estado') {

        setSensorEstado(msg);
      }


      // if (topic === 'caixa/nivel') setNivel(msg);
    };

    client.on('message', handleMessage);


    return () => {
      client.off('message', handleMessage);
    };
  }, []);

  const buscar = async () => {
    try {
      setBuscando(true);
      const dados = await buscarComFiltros({
        sensor: sensorFiltro || undefined,
        inicio: dataInicio || undefined,
        fim: dataFim || undefined
      });
      setResultados(dados);
      if (!dados.length) showToast('Nenhuma leitura encontrada para os filtros.');
    } catch (e) {
      showToast('Erro ao buscar leituras.');
      console.error(e);
    } finally {
      setBuscando(false);
    }
  };

  const enviar = async () => {
    if (!nome.trim() || !comando) {
      showToast('Informe o seu nome e selecione um comando.');
      return;
    }
    try {
      await enviarComando(nome.trim(), comando as 'ligar' | 'desligar');
      showToast('Comando enviado com sucesso!');
      setComando('');
    } catch (e) {
      showToast('Falha ao enviar comando.');
      console.error(e);
    }
  };

  const nivelBadgeColor = useMemo(() => {
    const v = (nivel || '').toLowerCase();
    if (['alto', 'cheio', 'ok'].some(s => v.includes(s))) return 'success';
    if (['medio', 'médio', 'intermediário'].some(s => v.includes(s))) return 'warning';
    if (['baixo', 'vazio', 'crítico'].some(s => v.includes(s))) return 'danger';
    return 'medium';
  }, [nivel]);

  const estadoBadgeColor = useMemo(() => {
    const v = (sensorEstado || '').toLowerCase();
    if (['ligada', 'ligado', 'ativo', 'ok', 'subindo'].some(s => v.includes(s))) return 'success';
    if (['desligada', 'desligado', 'falha', 'erro', 'caindo'].some(s => v.includes(s))) return 'danger';
    if (['desconhecido', '—'].some(s => v.includes(s))) return 'medium';
    return 'primary';
  }, [sensorEstado]);

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Monitoramento de Água</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={carregarUltimo} aria-label="Atualizar">
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className={styles.content}>
        <IonSegment value={tab} onIonChange={(e) => setTab(e.detail.value as any)} className={styles.segment}>
          <IonSegmentButton value="visao">
            <IonLabel>Visão Geral</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="historico">
            <IonLabel>Histórico</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {tab === 'visao' && (
          <IonGrid fixed>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <NivelCard titulo="Nível da Caixa" icon={water} badgeColor={nivelBadgeColor} valor={nivel} />
              </IonCol>
              <IonCol size="12" sizeMd="6">
                <NivelCard titulo="Estado do Sensor" icon={alertCircle} badgeColor={estadoBadgeColor} valor={sensorEstado} />
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12">
                <IonAccordionGroup>
                  <IonAccordion value="filtros">
                    <IonItem slot="header">
                      <IonIcon icon={funnel} slot="start" />
                      <IonLabel>Filtros de Histórico</IonLabel>
                    </IonItem>
                    <div className={styles.accordionBody} slot="content">
                      <IonGrid className={styles.filterGrid}>
                        <IonRow>
                          <IonCol size="12" sizeMd="4">
                            <IonItem>
                              <IonLabel position="stacked">Filtrar por Sensor</IonLabel>
                              <IonSelect
                                interface="popover"
                                placeholder="Selecione"
                                value={sensorFiltro}
                                onIonChange={e => setSensorFiltro(e.detail.value)}
                              >
                                <IonSelectOption value="">Todos</IonSelectOption>
                                <IonSelectOption value="alto">Alto</IonSelectOption>
                                <IonSelectOption value="medio">Médio</IonSelectOption>
                                <IonSelectOption value="baixo">Baixo</IonSelectOption>
                              </IonSelect>
                            </IonItem>
                          </IonCol>

                          <IonCol size="12" sizeMd="4">
                            <IonItem>
                              <IonLabel position="stacked">Data Início</IonLabel>
                              <IonDatetime
                                presentation="date"
                                firstDayOfWeek={1}
                                preferWheel
                                value={dataInicio}
                                onIonChange={e => setDataInicio(e.detail.value as string)}
                              />
                            </IonItem>
                          </IonCol>

                          <IonCol size="12" sizeMd="4">
                            <IonItem>
                              <IonLabel position="stacked">Data Fim</IonLabel>
                              <IonDatetime
                                presentation="date"
                                firstDayOfWeek={1}
                                preferWheel
                                value={dataFim}
                                onIonChange={e => setDataFim(e.detail.value as string)}
                              />
                            </IonItem>
                          </IonCol>
                        </IonRow>

                        <IonRow>
                          <IonCol size="12" className="ion-text-right">
                            <IonButton onClick={buscar} disabled={buscando}>
                              {buscando ? 'Buscando...' : 'Buscar Leituras'}
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </div>
                  </IonAccordion>
                </IonAccordionGroup>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Enviar Comando</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="stacked">Nome</IonLabel>
                            <IonInput
                              placeholder="Digite seu nome"
                              value={nome}
                              onIonInput={e => setNome(e.detail.value as string)}
                            />
                          </IonItem>
                        </IonCol>

                        <IonCol size="12" sizeMd="6">
                          <IonItem>
                            <IonLabel position="stacked">Comando</IonLabel>
                            <IonSelect
                              placeholder="Selecione"
                              value={comando}
                              onIonChange={e => setComando(e.detail.value as Comando)}
                            >
                              <IonSelectOption value="ligar">Ligar</IonSelectOption>
                              <IonSelectOption value="desligar">Desligar</IonSelectOption>
                            </IonSelect>
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol size="12" className="ion-text-right">
                          <IonButton onClick={enviar}>
                            <IonIcon icon={send} slot="start" />
                            Enviar Comando
                          </IonButton>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        {tab === 'historico' && (
          <IonGrid fixed>
            <IonRow>
              <IonCol size="12">
                <IonList inset className={styles.list}>
                  {carregando || buscando ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <IonItem key={i}>
                        <IonSkeletonText animated style={{ width: '40%' }} />
                        <IonSkeletonText animated style={{ width: '30%' }} />
                      </IonItem>
                    ))
                  ) : resultados.length ? (
                    resultados.map((item, idx) => (
                      <IonItem key={idx} lines="full">
                        <IonIcon icon={time} slot="start" />
                        <IonLabel>
                          <h3>
                            <IonBadge color="primary" className={styles.badge}>
                              {item.sensor ?? '—'}
                            </IonBadge>
                            <IonBadge color="medium" className={styles.badge}>
                              {item.estado ?? '—'}
                            </IonBadge>
                          </h3>
                          <IonNote>{item.timestamp}</IonNote>
                        </IonLabel>
                      </IonItem>
                    ))
                  ) : (
                    <IonItem>
                      <IonLabel>Nenhum registro encontrado.</IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={carregarUltimo} aria-label="Atualizar">
            <IonIcon icon={refresh} />
          </IonFabButton>
        </IonFab>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={1800}
          position="bottom"
          onDidDismiss={() => setToastMsg('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
