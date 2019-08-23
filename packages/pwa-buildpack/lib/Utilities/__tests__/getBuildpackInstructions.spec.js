const getBuildpackInstructions = require('../getBuildpackInstructions');
const fse = require('fs-extra');
const { resolve } = require('path');

test('gets and loads an instruction from node modules', () => {
    expect(
        getBuildpackInstructions(
            'package-with-instruction',
            ['return-fse-readjsonsync']
        ).instructions['return-fse-readjsonsync']
    ).toBe(fse.readJSONSync);
});

test('gets and loads an instruction from any folder', () => {
    expect(
        getBuildpackInstructions(
            resolve(__dirname, '__fixtures__', 'non-package-folder-with-instruction'),
            ['return-fse-readjsonsync']
        ).instructions['return-fse-readjsonsync']
    ).toBe(fse.readJSONSync);
});

test('throws informative error if instruction fails', () => {
    expect(
        () => getBuildpackInstructions(
            'package-with-bad-instruction',
            ['throw-on-execute']
        )
    ).toThrowErrorMatchingSnapshot();
});

test('throws informative error if instruction does not exist', () => {
    expect(
        () => getBuildpackInstructions(
            'package-with-no-instructions',
            ['return-fse-readjsonsync']
        )
    ).toThrowErrorMatchingSnapshot();
});
