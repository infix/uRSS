import React from "react";

type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

export const Icon: React.FC<Props> = ({ ...props }) => (
  <i style={{ margin: "auto 0" }} className="material-icons" {...props} />
);
