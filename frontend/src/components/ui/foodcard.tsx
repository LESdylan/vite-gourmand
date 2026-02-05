import React from "react";
import styles from "./foodcard.module.css";

export interface FoodCardProps {
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ name, description, price, imageUrl }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"}
          alt={name}
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        {description && <p className={styles.description}>{description}</p>}
        {price !== undefined && <div className={styles.price}>{price.toFixed(2)} €</div>}
      </div>
    </div>
  );
};
