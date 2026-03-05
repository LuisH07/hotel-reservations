import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; // Ícone para a lixeira
import styles from './RoomCard.module.css';

interface RoomCardProps {
  id: number;
  type: string;
  description: string;
  price: string;
  image: string;
  checkIn?: string;
  checkOut?: string;
  onCardClick?: () => void;
  onDelete?: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  id,
  type,
  description,
  checkIn,
  checkOut,
  price,
  image,
  onCardClick,
  onDelete,
}) => {
  const isManagerMode = !!onCardClick;

  const CardContent = (
    <article className={`${styles.roomCard} ${isManagerMode ? styles.managerCard : ''}`}>
      {isManagerMode && onDelete && (
        <button
          className={styles.deleteButton}
          onClick={(e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            onDelete();
          }}
        >
          <Trash2 size={18} />
        </button>
      )}
      
      <img src={image} alt={type} className={styles.roomImage} />
      
      <div className={styles.roomInfo}>
        <h3 className={styles.roomType}>{type}</h3>
        <p className={styles.roomDescription}>{description}</p>
        
        {checkIn && checkOut && (
          <span className={styles.roomDate}>
            {checkIn} até {checkOut}
          </span>
        )}
        
        <span className={styles.roomPrice}>{price}</span>
      </div>
    </article>
  );

  if (isManagerMode) {
    return (
      <div onClick={onCardClick} className={styles.clickableWrapper}>
        {CardContent}
      </div>
    );
  }

  const roomUrl = `/quarto/${id}?checkIn=${checkIn}&checkOut=${checkOut}`;
  return (
    <Link to={roomUrl} className={styles.cardLink}>
      {CardContent}
    </Link>
  );
};

export default RoomCard;