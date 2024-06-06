export const BundlePlanError = {
  max_deploy_per_day(bundlePlan: string) {
    if (bundlePlan === 'free') {
      return `You have reached the maximum number of 10 deployments for today.
       Please try again tomorrow, or upgrade your plan.`;
    }

    if (bundlePlan === 'standard') {
      return `You have reached the maximum number of 50 deployments for today.
       Please try again tomorrow, or upgrade your plan.`;
    }
  },

  mAX_SOURCE_SIZE(bundlePlan: string) {
    if (bundlePlan === 'free') {
      return `Maximum source size is 128MG on free plan. Please reduce source code size or upgrade your plan`;
    }

    if (bundlePlan === 'standard') {
      return `Maximum source size is 256MG. Please reduce source code size.`;
    }
  },
  MAX_BUILD_TIME(bundlePlan: string) {},
  germany_builder_not_allowed(bundlePlan: string) {
    if (bundlePlan === 'free') {
      return `You are not allowed to deploy in Germany builder on free plan.`;
    }
  },
  MAX_LOGS_PERIOD(bundlePlan: string) {},
  MAX_DISKS_LIMIT(bundlePlan: string) {},
};
