import React from 'react';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonBadge, IonIcon
} from '@ionic/react';
import { Icon } from 'ionicons/dist/types/components/icon/icon';
import styles from '../pages/Home.module.css';

interface NivelCardProps {
  titulo: string;
  valor: string;
  icon?: string;
  badgeColor?: string; 
}

const NivelCard: React.FC<NivelCardProps> = ({ titulo, valor, icon, badgeColor = 'medium' }) => {
  return (
    <IonCard className={styles.card}>
      <IonCardHeader>
        <div className={styles.cardHeader}>
          {icon && (
            <div className={styles.cardIcon}>
              <IonIcon icon={icon as unknown as Icon} />
            </div>
          )}
          <IonCardTitle>{titulo}</IonCardTitle>
        </div>
      </IonCardHeader>
      <IonCardContent>
        <IonBadge color={badgeColor} className={styles.cardValue}>
          {valor || '—'}
        </IonBadge>
      </IonCardContent>
    </IonCard>
  );
};

export default NivelCard;
