import { FC, useState } from "react";

enum Status {
  DEFAULT,
  SUCCESS,
  ERROR,
}

interface ComponentProps {
  alt: string;
  url?: string;
}

const Component: FC<ComponentProps> = ({ alt, url }) => {
  const [status, setStatus] = useState(Status.DEFAULT);

  return status === Status.ERROR ? (
    <span className={"token-image"}>{alt.toUpperCase().charAt(0)}</span>
  ) : (
    <img
      alt={alt}
      src={url || `/coins/${alt.toLowerCase()}.svg`}
      onError={() => setStatus(Status.ERROR)}
      onLoad={() => setStatus(Status.SUCCESS)}
      className={`token-image${status === Status.DEFAULT ? " hidden" : ""}`}
    />
  );
};

export default Component;
