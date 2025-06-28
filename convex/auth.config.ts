// export default {
//   providers: [
//     {
//       domain: "https://successful-trout-122.convex.site",
//       applicationID: "convex",
//     },
//     {
//       domain: "https://diligent-schnauzer-735.convex.site",
//       applicationID: "convex_production",
//     },
//   ],
// };

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
