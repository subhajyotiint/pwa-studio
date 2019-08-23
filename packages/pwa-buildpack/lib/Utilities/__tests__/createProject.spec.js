const createProject = require('../createProject');
const { resolve } = require('path');

const mockBase = require.resolve('buildpack-template-package');

const packageFile = relativePath => resolve(mockBase, '..', relativePath);

const { mock } = require(packageFile('.buildpack/create'));

test('createProject accepts a visitor object', async () => {
    await createProject({
        template: 'buildpack-template-package',
        directory: 'fake/path'
    });
    expect(mock.visitor['index.js']).toHaveBeenCalledWith(
        expect.objectContaining({
            path: packageFile('index.js')
        })
    );
    const [[first], [second]] = mock.visitor['**/*.css'].mock.calls;
    expect(first.path).toBe(packageFile('stylesheets/index.css'));
    expect(second.path).toBe(
        packageFile('stylesheets/other-stylesheets/other.css')
    );
    expect(mock.after).toHaveBeenCalled();
});

test('createProject fails if a handler fails', async () => {
    mock.visitor['index.js'].mockImplementationOnce(() => {
        throw new Error('guh');
    });

    mock.after.mockImplementationOnce(() => {
        throw new Error('bleh');
    });

    await expect(
        createProject({
            template: 'buildpack-template-package',
            directory: 'fake/path'
        })
    ).rejects.toThrow('guh');
    await expect(
        createProject({
            template: 'buildpack-template-package',
            directory: 'fake/path'
        })
    ).rejects.toThrow('bleh');
});

test('createProject will not run a missing after()', async () => {
    mock.after = false;
    await expect(
        createProject({
            template: 'buildpack-template-package',
            directory: 'fake/path'
        })
    ).resolves.toBe(undefined);
});
