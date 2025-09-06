"use client";

import { Authenticated } from "convex/react";

export const AuthenticatedProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Authenticated>{children}</Authenticated>;
};
