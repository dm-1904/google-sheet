import { memo, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';

type GuideCardProps = {
  title: string;
  description: string;
  imageSrc: string;
  to: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
};

const FALLBACK_GUIDE_IMAGE = '/arizona-home-1.jpg';

const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
  const image = event.currentTarget;
  if (image.src.endsWith(FALLBACK_GUIDE_IMAGE)) {
    return;
  }
  image.src = FALLBACK_GUIDE_IMAGE;
};

const GuideCardComponent = ({
  title,
  description,
  imageSrc,
  to,
  imageFit = 'cover',
  imagePosition,
}: GuideCardProps) => {
  const imageClassName =
    imageFit === 'contain' ? 'guide-card__image guide-card__image--contain' : 'guide-card__image';

  return (
    <Link to={to} className="guide-card" aria-label={`Open ${title} guide`}>
      <img
        className={imageClassName}
        src={imageSrc}
        alt={`${title} neighborhood guide`}
        style={imagePosition ? { objectPosition: imagePosition } : undefined}
        onError={handleImageError}
        loading="lazy"
        decoding="async"
      />
      <div className="guide-card__body">
        <h3 className="guide-card__title">{title}</h3>
        <p className="guide-card__description">{description}</p>
      </div>
    </Link>
  );
};

export const GuideCard = memo(GuideCardComponent);
