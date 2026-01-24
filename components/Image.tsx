"use client";

import { FC, useState } from "react";
import { default as NextImage, ImageProps } from "next/image";
import classNames from "classnames";

const Image: FC<ImageProps> = ({ className, onLoad, ...props }) => {
  const [isReady, setIsReady] = useState<boolean>(false);
  const onLoadCallback = (e: any) => {
    setIsReady(true);
    if (typeof onLoad === "function") {
      onLoad(e);
    }
  };

  const imageClassName = {
    onload: !isReady,
    "onload-complete": isReady
  };

  return (
    <NextImage
      className={classNames(className, imageClassName)}
      onLoad={onLoadCallback}
      {...props}
    />
  );
};

export default Image;
