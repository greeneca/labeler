import * as core from '@actions/core';
import * as github from '@actions/github';

export interface MergableMatchConfig {
  mergable?: string[];
}

type Mergable = 'dirty' | 'blocked' | 'behind' | 'clean';

export function toMergableMatchConfig(config: any): MergableMatchConfig {
  if (!config['mergable']) {
    return {};
  }

  const mergableConfig = {
    mergable: config['mergable']
  };

  if (typeof mergableConfig.mergable === 'string') {
mergableConfig.mergable = [mergableConfig.mergable];
  }

  return mergableConfig;
}

export function getMergable(): Mergable | undefined {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    core.debug(`   no pull request found in context`);
    return undefined;
  }
  core.debug(`   pull request state is ${pullRequest.mergableState}`);

  return pullRequest.mergeableState as Mergable;
}

export function checkAnyMergable(
  regexps: string[],
  mergable: Mergable | undefined
): boolean {
  if (!mergable) {
    core.debug(`   no mergable status`);
    return false;
  }

  core.debug(`   checking "mergable" pattern against ${mergable}`);
  const matchers = regexps.map(regexp => new RegExp(regexp));
  for (const matcher of matchers) {
    if (matchMergeablePattern(matcher, mergable)) {
      core.debug(`   "mergable" patterns matched against ${mergable}`);
      return true;
    }
  }

  core.debug(`   "mergable" patterns did not match against ${mergable}`);
  return false;
}

export function checkAllMergable(
  regexps: string[],
  mergable: Mergable | undefined
): boolean {
  if (!mergable) {
    core.debug(`   no mergable status`);
    return false;
  }

  core.debug(`   checking "mergable" pattern against ${mergable}`);
  const matchers = regexps.map(regexp => new RegExp(regexp));
  for (const matcher of matchers) {
    if (!matchMergeablePattern(matcher, mergable)) {
      core.debug(`   "mergable" patterns did not match against ${mergable}`);
      return false;
    }
  }

  core.debug(`   "mergable" patterns matched against ${mergable}`);
  return false;
}

function matchMergeablePattern(matcher: RegExp, mergable: Mergable): boolean {
  const matched = matcher.test(mergable);
  if (matched) {
    core.debug(`     "mergable" pattern ${matcher} matched ${mergable}`);
  } else {
    core.debug(`     "mergable" pattern ${matcher} did not match ${mergable}`);
  }
  return matched;
}

