// export default {
//   providers: [
//     {
//       domain: "https://successful-trout-122.convex.site",
//       applicationID: "convex",
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
