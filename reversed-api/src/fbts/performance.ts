import ExecutionEnvironment from './ExecutionEnvironment';

let performance: Performance;

if (ExecutionEnvironment.canUseDOM) {
  performance =
    // @ts-ignore
    window.performance || window.msPerformance || window.webkitPerformance;
}

export default performance || ({} as Performance);
