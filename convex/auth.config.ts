export default {
  providers: [
    {
      // convex dashboard 에서 관리함.
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
