import React, { useEffect, useState } from 'react';
import styles from './foodcard.module.css';
import { API_URL, FALLBACK_IMAGE_URL } from '../../styles/constant';

export interface FoodCardProps {
  name: string;
  description?: string;
  price?: number;
  imageUrl?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ name, description, price, imageUrl }) => {
  const [randomImage, setRandomImage] = useState<string | null>(null);

  /**
   * if we don't provide an image, the card will automatically fetch a ranom food photo from splash API.
   * This is for demonstration purpose only, in a real app we want to handle that differently.
   * NOTE: The Unsplash API has a rate limit of 50 <req </hour>
   * if the fectch fails, we fallback to a default image.
   * .then(res => res.json()) is used to parse the response as JSON, and we extract the regular size image URL from the response data.
   * .then
   *
   */
  {
    useEffect(() => {
      if (!imageUrl) {
        fetch(API_URL)
          .then((res) => res.json())
          .then((data) => setRandomImage(data.urls?.regular))
          // catch is important here to avoid unhandled promise rejection if the API call fails, we fallback to a default image in that case.
          .catch(() => setRandomImage(FALLBACK_IMAGE_URL));
      }
    }, [imageUrl]);
  }
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl || randomImage || FALLBACK_IMAGE_URL}
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
