module.exports = {
  testPathForConsistencyCheck: 'some/tests/example.test.js',

  /** resolves from test to snapshot path */
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    return testPath.replace('src/', 'snapshots/') + snapshotExtension
  },

  /** resolves from snapshot to test path */
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    return snapshotFilePath
      .replace('snapshots/', 'src/')
      .slice(0, -snapshotExtension.length)
  },
}