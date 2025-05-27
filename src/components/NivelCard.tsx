import React from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';

interface NivelCardProps {
  titulo: string;
  valor: string;
}

const NivelCard: React.FC<NivelCardProps> = ({ titulo, valor }) => {
  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>{titulo}</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {valor}
      </IonCardContent>
    </IonCard>
  );
};

export default NivelCard;
