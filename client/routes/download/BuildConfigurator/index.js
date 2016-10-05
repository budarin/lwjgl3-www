import React from 'react'
import {createSelector} from 'reselect'
import reducer from './reducer'
import saga from './saga'

import * as $$ from './actions'

import {
  BUILD_RELEASE,
  BUILD_NIGHTLY,
  MODE_ZIP,
  MODE_MAVEN,
  MODE_GRADLE,
} from './constants'

// import ControlledAlert from '../../components/ControlledAlert'
import ControlledPanel from '../../../components/ControlledPanel'
import ControlledRadio from '../../../components/ControlledRadio'
import ControlledCheckbox from '../../../components/ControlledCheckbox'
import BuildType from './components/BuildType'
import BuildPlatform from './components/BuildPlatform'
import BuildArtifacts from './components/BuildArtifacts'
import BuildDownload from './components/BuildDownload'
import BuildScript from './components/BuildScript'
import BuildBundler from './components/BuildBundler'

const getMode = state => state.build.mode;
const getBuild = state => state.build.build;
const getPreset = state => state.build.preset;
const getLanguage = state => state.build.language;
const getVersion = state => state.build.version;
const isBuildSelected = state => getBuild(state) !== null;
const isModeGradle = state => getMode(state) === MODE_GRADLE;
const isModeMaven = state => getMode(state) === MODE_MAVEN;
const isModeZip = state => getMode(state) === MODE_ZIP;
const isModeNotZip = state => getMode(state) !== MODE_ZIP;
const isBuildRelease = state => getBuild(state) === BUILD_RELEASE;
const isDownloading = state => state.build.downloading;
const isNotDownloading = state => !state.build.downloading;

const fields = {
  mode: {
    name: "mode",
    value: getMode,
    action: $$.changeMode,
    options: createSelector(
      state => state.build.modes,
      state => state.build.build === BUILD_NIGHTLY,
      (modes, isNightly) => modes.allIds.map(
        mode => ({
          value: mode,
          label: modes.byId[mode].title,
          disabled: mode !== MODE_ZIP && !isNightly,
        })
      )
    ),
  },
  preset: {
    name: "preset",
    value: getPreset,
    action: $$.changePreset,
    options: createSelector(
      state => state.build.presets,
      state => state.build.mode,
      state => state.build.build,
      (presets, mode, build) => presets.allIds.map(
        preset => ({
          value: preset,
          label: presets.byId[preset].title,
          disabled: mode === MODE_ZIP && build !== BUILD_NIGHTLY,
        })
      )
    ),
  },
  language: {
    name: "language",
    value: getLanguage,
    action: $$.changeLanguage,
    options: createSelector(
      state => state.build.languages,
      languages => languages.allIds.map(
        lang => ({
          value: lang,
          label: languages.byId[lang].title,
          disabled: lang !== 'groovy',
        })
      )
    ),
  },
  version: {
    name: "version",
    value: getVersion,
    action: $$.changeVersion,
    options: createSelector(
      state => state.build.versions,
      state => state.build.builds.byId[state.build.build].latest,
      (versions, latest) => versions.allIds.map(
        version => {
          const semver = versions.byId[version].semver;

          return {
            value: version,
            label: version,
            disabled: !(semver[0] < latest[0] || semver[1] < latest[1] || semver[2] <= latest[2])
          };
        }
      )
    ),
  },
  descriptions: {
    label: "Show descriptions",
    checked: state => state.build.descriptions,
    action: $$.toggleDescriptions,
  },
  source: {
    label: "Include source",
    checked: state => state.build.source || state.build.build !== BUILD_NIGHTLY,
    action: $$.toggleSource,
    hidden: isModeNotZip,
    disabled: state => state.build.build !== BUILD_NIGHTLY,
  },
  javadoc: {
    label: "Include JavaDoc",
    checked: state => state.build.javadoc || state.build.build !== BUILD_NIGHTLY,
    action: $$.toggleJavadoc,
    hidden: isModeNotZip,
    disabled: state => state.build.build !== BUILD_NIGHTLY,
  },
  compact: {
    label: "Compact Mode",
    checked: state => state.build.compact,
    action: $$.toggleCompact,
    hidden: state => !isModeMaven(state),
  },
  hardcoded: {
    label: "Do not use variables",
    checked: state => state.build.hardcoded,
    action: $$.toggleHardcoded,
    hidden: state => isModeZip(state),
  },
};

const BuildContainer = props => (
  <div>
    {/*<ControlledAlert selector={state => state.build.error} reset={$$.errorReset} />*/}
    <div className="row">
      <div className="col-lg-4 col-xs-12">
        <BuildType build="release" />
      </div>
      <div className="col-lg-4 col-xs-12">
        <BuildType build="stable" />
      </div>
      <div className="col-lg-4 col-xs-12">
        <BuildType build="nightly" />
      </div>
    </div>
    <ControlledPanel className="row" predicate={isBuildSelected}>
      <div className="col-xs-12">
        <div className="build-config">
          <ControlledPanel className="row" predicate={isNotDownloading}>
            <div className="col-xs-12 col-lg-3">
              <h2 className="m-y-1">Mode</h2>
              <ControlledRadio spec={fields.mode} />

              <BuildPlatform />

              <h2 className="m-b-1">Presets</h2>
              <ControlledRadio spec={fields.preset} />

              <h2 className="m-b-1">Options</h2>
              <ControlledCheckbox spec={fields.descriptions} />
              <ControlledCheckbox spec={fields.source} />
              <ControlledCheckbox spec={fields.javadoc} />
              <ControlledCheckbox spec={fields.compact} />
              <ControlledCheckbox spec={fields.hardcoded} />

              <ControlledPanel predicate={isModeGradle}>
                <h2 className="m-b-1">Language</h2>
                <ControlledRadio spec={fields.language} />
              </ControlledPanel>

              <ControlledPanel predicate={isBuildRelease}>
                <h2 className="m-b-1">Version</h2>
                <ControlledRadio spec={fields.version} />
              </ControlledPanel>
            </div>

            <BuildArtifacts />
            <BuildDownload />
            <BuildScript />

          </ControlledPanel>
          <ControlledPanel className="row" predicate={isDownloading}>
            <BuildBundler />
          </ControlledPanel>
        </div>
      </div>
    </ControlledPanel>
  </div>
);

BuildContainer.reducer = reducer;
BuildContainer.saga = saga;

export default BuildContainer
